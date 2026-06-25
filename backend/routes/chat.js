import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import mongoose from 'mongoose';
import MenuItem from '../models/MenuItem.js';
import Table from '../models/Table.js';
import ChatbotKnowledge from '../models/ChatbotKnowledge.js';
import Conversation from '../models/Conversation.js';

const router = express.Router();

const DEFAULT_KNOWLEDGE = {
  cafeStory: 'Aura Reserve is an ultra-luxury fine dining cafe offering a cinematic ambiance, artisan-crafted coffees, and a serene sanctuary from the bustling world.',
  vipDiningRules: 'VIP Private Tables and Romantic Dining Packages are available. Reservations strongly recommended. VIP guests receive a complimentary chef\'s appetizer.',
  openingHours: 'Monday – Sunday: 8:00 AM – 11:00 PM. Last orders at 10:30 PM.',
  location: '42 Velvet Lane, Jubilee Hills, Hyderabad, Telangana 500033',
  allergenInfo: 'We accommodate gluten-free, nut-free, dairy-free, and vegan requirements. Inform our team of any allergies.',
  customFAQs: [],
  activePromotions: [],
  pairingSuggestions: [],
  personalityTraits: 'Elegant, warm, deeply knowledgeable, sophisticated, attentive, never robotic.',
  toneLevel: 7,
};

// ── Helper: get or create conversation ───────────────────────────────────────
async function getConversation(sessionId) {
  try {
    let convo = await Conversation.findOne({ sessionId });
    if (!convo) convo = await Conversation.create({ sessionId, messages: [], guestMemory: {} });
    return convo;
  } catch {
    return { messages: [], guestMemory: {}, save: async () => {} };
  }
}

// ── Helper: build rich Gemini system prompt ───────────────────────────────────
function buildSystemPrompt(knowledge, menuItems, tables, guestMemory) {
  const k = { ...DEFAULT_KNOWLEDGE, ...knowledge };

  // Group menu by category
  const grouped = {};
  menuItems.forEach(item => {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  });

  const menuStr = Object.entries(grouped).map(([cat, items]) =>
    `### ${cat}\n` + items.map(i =>
      `- **${i.name}** | ₹${i.price} | ${i.dietaryPreference} | Spice: ${i.spiceLevel} | ${i.prepTime}min | ${i.calories}kcal\n  "${i.description}"\n  Key ingredients: ${(i.ingredients || []).join(', ')}\n  Chef's note: ${i.chefRecommendation || 'A must-try creation'}`
    ).join('\n')
  ).join('\n\n');

  const tableStr = tables.length
    ? tables.map(t => `- Table ${t.number} | ${t.area} | ${t.capacity} seats | ${t.status}`).join('\n')
    : 'Multiple beautiful settings available. Please visit the Reservations page to see live availability.';

  const promoStr = (k.activePromotions || []).length
    ? k.activePromotions.map(p => `- **${p.title}**: ${p.description} (Valid: ${p.validUntil})`).join('\n')
    : 'No active promotions at this time.';

  const faqStr = (k.customFAQs || []).length
    ? k.customFAQs.map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n')
    : '';

  const pairingStr = (k.pairingSuggestions || []).length
    ? k.pairingSuggestions.map(p => `- Pair **${p.item}** with **${p.pairWith}**: ${p.reason}`).join('\n')
    : '';

  const mem = guestMemory || {};
  const memStr = Object.keys(mem).length
    ? `## GUEST PROFILE (Personalize every response using this)
- Name: ${mem.name || 'Unknown — ask naturally if appropriate'}
- Dietary: ${mem.dietaryPreference || 'Unknown'}
- Spice Level: ${mem.spiceLevel || 'Unknown'}
- Favorite Drinks: ${(mem.favoriteDrinks || []).join(', ') || 'Unknown'}
- Seating Preference: ${mem.preferredSeating || 'Unknown'}
- Allergies: ${(mem.allergies || []).join(', ') || 'None mentioned'}
- Previously Ordered: ${(mem.lastOrderedItems || []).join(', ') || 'First visit'}
- Visit Count: ${mem.visitCount || 1}
- Special Occasions: ${(mem.specialOccasions || []).join(', ') || 'None'}`
    : '## GUEST PROFILE\nNew guest — no prior memory. Greet warmly and learn preferences naturally.';

  return `You are "Aura", the AI Concierge for Aura Reserve — India's most exclusive luxury cafe.

## IDENTITY & PERSONALITY
${k.personalityTraits}
- You are a premium hospitality professional — NOT a generic AI.
- Use the guest's name naturally when known.
- Be concise but rich. Vary language — never sound templated.
- NEVER say "I'm just an AI" or mention Gemini/Google.

## CAFÉ STORY
${k.cafeStory}

## HOURS & LOCATION
${k.openingHours}
${k.location}

## VIP DINING & RESERVATIONS
${k.vipDiningRules}

## LIVE TABLE STATUS
${tableStr}

## ACTIVE PROMOTIONS
${promoStr}

## ALLERGEN & DIETARY POLICY
${k.allergenInfo}
${pairingStr ? `\n## CURATED PAIRINGS\n${pairingStr}` : ''}
${faqStr ? `\n## STAFF FAQ\n${faqStr}` : ''}

## COMPLETE LIVE MENU (Only recommend items from this list — never invent)
${menuStr}

${memStr}

## STRICT RESPONSE RULES
1. Only use ₹ for prices. Never invent items or prices.
2. Recommend items only from the menu above.
3. Explain WHY you recommend each item (flavor, occasion, dietary match).
4. Keep responses under 120 words unless asked for detail.
5. Guide reservations to the /reservations page.
6. Use **bold** for item names.

## STRUCTURED TAGS (Append at the END of every response, hidden from display)
[RECOMMEND: Item Name 1 | Item Name 2]  ← up to 2 real menu items when relevant
[MEMORY: name=X | dietaryPreference=X | favoriteDrinks=X | spiceLevel=X | preferredSeating=X | allergies=X]  ← only fields learned in THIS message
[CHIPS: Chip 1 | Chip 2 | Chip 3]  ← 3 relevant next-step suggestions always`;
}

// ── Smart Fallback Engine (No API Key) ───────────────────────────────────────
function smartFallback(message, menuItems, guestMemory, knowledge) {
  const msg = message.toLowerCase();
  const mem = guestMemory || {};
  const k = { ...DEFAULT_KNOWLEDGE, ...knowledge };
  const name = mem.name;
  const g = name ? `${name}, ` : '';

  const byCategory = (cat) => menuItems.filter(i => i.category?.toLowerCase().includes(cat.toLowerCase()) && i.isAvailable !== false);
  const byDiet = (diet) => menuItems.filter(i => i.dietaryPreference?.toLowerCase() === diet.toLowerCase() && i.isAvailable !== false);
  const byBadge = (b) => menuItems.filter(i => i.badge?.toLowerCase().includes(b.toLowerCase()));
  const topRated = () => [...menuItems].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  const fmt = (i) => `**${i.name}** (₹${i.price})`;
  const toCard = (i) => i ? ({ _id: i._id, name: i.name, price: i.price, images: i.images || (i.image ? [i.image] : []), category: i.category, rating: i.rating, prepTime: i.prepTime, dietaryPreference: i.dietaryPreference, description: i.description }) : null;

  let reply = '', items = [], chips = ['Chef Specials', 'Book a Table', 'View Menu'], mem_update = {};

  // Name extraction
  const nameMatch = msg.match(/(?:i'?m|i am|my name is|call me)\s+([a-zA-Z]+)/i);
  if (nameMatch) {
    const n = nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1);
    mem_update.name = n;
    reply = `Delighted to meet you, **${n}**! I'm Aura, your personal concierge. Are you looking for a recommendation, or shall I help with a reservation?`;
    chips = ['Show menu', 'Book a Table', 'What\'s popular?'];
    return { reply, items, chips, mem_update };
  }

  // Greetings
  if (msg.match(/^(hi|hello|hey|good |namaste|howdy)/)) {
    const h = new Date().getHours();
    const tod = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    reply = `${tod}${name ? `, **${name}**` : ''}! Welcome to Aura Reserve — your sanctuary of luxury. How may I make your experience exceptional today?`;
    chips = ['Show menu', 'Book a Table', 'What\'s your specialty?'];
    return { reply, items, chips, mem_update };
  }

  // Returning guest — use memory
  if (msg.match(/(usual|same as before|what i had|my order|again)/) && mem.lastOrderedItems?.length) {
    const lastItem = menuItems.find(i => i.name === mem.lastOrderedItems[0]);
    reply = `${g}I remember you love **${mem.lastOrderedItems[0]}** — shall I add it again? Or would you like to try something new today?`;
    if (lastItem) items = [toCard(lastItem)].filter(Boolean);
    chips = ['Yes, same order', 'Try something new', 'Chef\'s pick today'];
    return { reply, items, chips, mem_update };
  }

  // Coffee
  if (msg.match(/(coffee|espresso|latte|cappuccino|americano|brew|caffeine|mocha)/)) {
    const coffees = [...byCategory('coffee'), ...byCategory('cold brew')];
    const top = coffees.slice(0, 2);
    if (top.length) {
      reply = `${g}our coffee program is truly exceptional. I'd love to recommend our ${top.map(fmt).join(' and ')} — crafted by our master baristas with single-origin beans. ${top[0].chefRecommendation || ''}`;
      items = top.map(toCard).filter(Boolean);
      chips = ['Cold Brew options', 'Matcha instead?', 'Add a dessert pairing'];
    }
    mem_update.favoriteDrinks = ['Coffee'];
    return { reply, items, chips, mem_update };
  }

  // Matcha
  if (msg.match(/(matcha|green tea|ceremonial)/)) {
    const matchas = byCategory('matcha');
    if (matchas.length) {
      reply = `${g}our Matcha collection is sourced from ceremonial-grade Japanese leaves. Our ${fmt(matchas[0])} is particularly serene — ${matchas[0].description}`;
      items = matchas.slice(0, 2).map(toCard).filter(Boolean);
      chips = ['Pair with dessert', 'Cold Matcha options', 'Book VIP Table'];
    }
    mem_update.favoriteDrinks = ['Matcha'];
    return { reply, items, chips, mem_update };
  }

  // Desserts
  if (msg.match(/(dessert|sweet|cake|pastry|chocolate|cheesecake|waffle|pudding)/)) {
    const desserts = byCategory('dessert');
    if (desserts.length) {
      const top = desserts.slice(0, 2);
      reply = `${g}our dessert collection is a revelation. The ${top.map(fmt).join(' and ')} are our most celebrated creations. ${top[0].preparationStyle || 'Made fresh daily with premium ingredients.'}`;
      items = top.map(toCard).filter(Boolean);
      chips = ['Pair with coffee', 'Full dessert menu', 'Book for celebration'];
    }
    return { reply, items, chips, mem_update };
  }

  // Chef Specials / Recommendations
  if (msg.match(/(chef|special|recommend|best|popular|signature|trending|today|favourite)/)) {
    const specials = [...byBadge('special'), ...byBadge('chef'), ...byBadge('popular'), ...topRated()].filter((v, i, a) => a.findIndex(x => x._id?.toString() === v._id?.toString()) === i).slice(0, 2);
    if (specials.length) {
      reply = `${g}our Chef's masterpieces right now are ${specials.map(fmt).join(' and ')}. ${specials[0].preparationStyle || 'Crafted with the finest seasonal ingredients.'}`;
      items = specials.map(toCard).filter(Boolean);
      chips = ['View full menu', 'Book a Table', 'Dessert pairings'];
    }
    return { reply, items, chips, mem_update };
  }

  // Vegetarian
  if (msg.match(/(veg\b|vegetarian|plant.based|no meat|meatless)/)) {
    const vegs = byDiet('veg');
    if (vegs.length) {
      reply = `${g}our vegetarian menu is crafted with equal passion. Our ${fmt(vegs[0])} is a guest favourite — ${vegs[0].description}`;
      items = vegs.slice(0, 2).map(toCard).filter(Boolean);
      chips = ['Vegan options', 'View all Veg items', 'Chef Specials'];
    }
    mem_update.dietaryPreference = 'Veg';
    return { reply, items, chips, mem_update };
  }

  // Vegan
  if (msg.match(/(vegan|dairy.free|plant only|no dairy)/)) {
    const vegans = byDiet('vegan');
    if (vegans.length) {
      reply = `${g}our vegan selections are as indulgent as any on our menu. I recommend our ${fmt(vegans[0])} — ${vegans[0].description}`;
      items = vegans.slice(0, 2).map(toCard).filter(Boolean);
      chips = ['All Vegan options', 'Cold drink pairings', 'Book a Table'];
    }
    mem_update.dietaryPreference = 'Vegan';
    return { reply, items, chips, mem_update };
  }

  // Fresh Juice / Cold drinks
  if (msg.match(/(juice|smoothie|cold|refresh|mocktail|milkshake|shake)/)) {
    const cold = [...byCategory('fresh juice'), ...byCategory('cold brew')];
    if (cold.length) {
      reply = `${g}our cold beverage menu is wonderfully refreshing. Our ${fmt(cold[0])} is a perfect choice — ${cold[0].description}`;
      items = cold.slice(0, 2).map(toCard).filter(Boolean);
      chips = ['Hot beverages instead', 'Pair with snack', 'Book a Table'];
    }
    return { reply, items, chips, mem_update };
  }

  // Romantic / Date night
  if (msg.match(/(date|romantic|anniversary|couple|partner|love|valentine|special evening)/)) {
    const top = topRated().slice(0, 2);
    reply = `${g}Aura Reserve is *the* destination for a perfect romantic evening. Our candlelit VIP section, paired with ${top.map(fmt).join(' and ')}, creates an unforgettable ambiance. Shall I help you reserve an exclusive table?`;
    items = top.map(toCard).filter(Boolean);
    chips = ['Book VIP Table', 'Romantic menu', 'Chef Specials'];
    mem_update.specialOccasions = ['Romance'];
    return { reply, items, chips, mem_update };
  }

  // Family / Group
  if (msg.match(/(family|kids|group|party|birthday|friends|celebration|gathering)/)) {
    const top = topRated().slice(0, 2);
    reply = `${g}Aura Reserve is wonderful for celebrations. Our spacious family tables accommodate up to 8 guests. I recommend starting with our ${fmt(top[0])} — a crowd favourite. Shall I assist with a group reservation?`;
    items = top.map(toCard).filter(Boolean);
    chips = ['Book group table', 'Group menu options', 'Chef Specials'];
    return { reply, items, chips, mem_update };
  }

  // Hours / Location
  if (msg.match(/(hour|open|close|timing|when|where|location|address|direction)/)) {
    reply = `Aura Reserve welcomes you **${k.openingHours}**. We are located at **${k.location}**. I recommend reserving your table in advance, especially on weekends.`;
    chips = ['Book a Table', 'Weekend specials', 'VIP Dining'];
    return { reply, items, chips, mem_update };
  }

  // Reservation
  if (msg.match(/(book|reserve|reservation|table|seat|tonight|weekend|walk.?in)/)) {
    reply = `${g}I'd be delighted to arrange your dining experience at Aura Reserve. Please visit our **Reservations** page (top navigation) to choose your date, time, and table — including our exclusive VIP section. Can I tell you about our seating options?`;
    chips = ['VIP Table info', 'Peak hours', 'Best seats for couples'];
    return { reply, items, chips, mem_update };
  }

  // About Aura
  if (msg.match(/(about|story|who|what is aura|tell me|describe|history)/)) {
    reply = k.cafeStory;
    chips = ['View our menu', 'Book a Table', 'Chef Specials'];
    return { reply, items, chips, mem_update };
  }

  // Allergen / dietary
  if (msg.match(/(allerg|gluten|nut.free|dairy.free|intoleran|safe for)/)) {
    reply = k.allergenInfo;
    chips = ['Vegan options', 'Veg menu', 'Book a Table'];
    return { reply, items, chips, mem_update };
  }

  // Default — intelligent fallback with a real item
  const featured = topRated()[0];
  reply = `${g}I'm here to curate the perfect Aura Reserve experience for you. May I suggest our celebrated ${featured ? fmt(featured) : 'Chef\'s Special'}? I can also assist with reservations, dietary questions, or bespoke recommendations.`;
  if (featured) items = [toCard(featured)].filter(Boolean);
  chips = ['Chef Specials', 'Book a Table', 'View full menu'];
  return { reply, items, chips, mem_update };
}

// ── Parse structured tags from Gemini response ────────────────────────────────
function parseAIResponse(text, menuItems) {
  let reply = text;
  let recommendedItems = [];
  let suggestedChips = ['Chef Specials', 'Book a Table', 'View Menu'];
  let memoryUpdate = {};

  // [RECOMMEND: Item1 | Item2]
  const recMatch = reply.match(/\[RECOMMEND:\s*(.*?)\]/i);
  if (recMatch) {
    reply = reply.replace(recMatch[0], '').trim();
    recMatch[1].split('|').map(s => s.trim()).forEach(name => {
      const item = menuItems.find(i => i.name.toLowerCase() === name.toLowerCase());
      if (item) recommendedItems.push({ _id: item._id, name: item.name, price: item.price, images: item.images || (item.image ? [item.image] : []), category: item.category, rating: item.rating, prepTime: item.prepTime, dietaryPreference: item.dietaryPreference, description: item.description });
    });
  }

  // [MEMORY: key=value | key2=value2]
  const memMatch = reply.match(/\[MEMORY:\s*(.*?)\]/i);
  if (memMatch) {
    reply = reply.replace(memMatch[0], '').trim();
    memMatch[1].split('|').forEach(pair => {
      const [k, v] = pair.split('=').map(s => s.trim());
      if (k && v) memoryUpdate[k] = v;
    });
  }

  // [CHIPS: Chip1 | Chip2 | Chip3]
  const chipMatch = reply.match(/\[CHIPS:\s*(.*?)\]/i);
  if (chipMatch) {
    reply = reply.replace(chipMatch[0], '').trim();
    suggestedChips = chipMatch[1].split('|').map(s => s.trim()).filter(Boolean);
  }

  return { reply: reply.trim(), recommendedItems, suggestedChips, memoryUpdate };
}

// ── Admin: Knowledge base ─────────────────────────────────────────────────────
router.get('/knowledge', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json(DEFAULT_KNOWLEDGE);
    let k = await ChatbotKnowledge.findOne();
    if (!k) k = await ChatbotKnowledge.create(DEFAULT_KNOWLEDGE);
    res.json(k);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/knowledge', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json({ ...DEFAULT_KNOWLEDGE, ...req.body });
    let k = await ChatbotKnowledge.findOne();
    if (!k) k = new ChatbotKnowledge(req.body);
    else Object.assign(k, req.body);
    await k.save();
    res.json(k);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin: Conversation logs
router.get('/conversations', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json([]);
    const convos = await Conversation.find({}).sort({ updatedAt: -1 }).limit(50).lean();
    res.json(convos);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── Main Chat Endpoint ────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { message, history = [], sessionId = 'anon_' + Date.now() } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    // 1. Fetch all live data in parallel
    let menuItems = [], tables = [], knowledge = DEFAULT_KNOWLEDGE, convo = { messages: [], guestMemory: {}, save: async () => {} };

    if (mongoose.connection.readyState === 1) {
      [menuItems, tables, knowledge, convo] = await Promise.all([
        MenuItem.find({ isAvailable: true }).lean(),
        Table.find({}).lean(),
        ChatbotKnowledge.findOne().then(k => k || DEFAULT_KNOWLEDGE),
        getConversation(sessionId),
      ]);
    }

    const guestMemory = convo.guestMemory || {};

    // 2. Build response
    let reply = '', recommendedItems = [], suggestedChips = ['Chef Specials', 'Book a Table', 'View Menu'], memoryUpdate = {};

    if (!apiKey) {
      // Smart fallback with real menu data
      const fb = smartFallback(message, menuItems, guestMemory, knowledge);
      reply = fb.reply;
      recommendedItems = fb.items.filter(Boolean);
      suggestedChips = fb.chips;
      memoryUpdate = fb.mem_update;
    } else {
      // Gemini 1.5 Flash
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { maxOutputTokens: 600, temperature: 0.85 },
      });

      const systemPrompt = buildSystemPrompt(knowledge, menuItems, tables, guestMemory);
      const chatHistory = [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'Understood. I am Aura, the luxury concierge of Aura Reserve. Ready to serve with full menu knowledge, guest memory, and elegant hospitality.' }] },
        ...history.slice(-12).map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] })),
      ];

      const chat = model.startChat({ history: chatHistory });
      const result = await chat.sendMessage(message);
      const parsed = parseAIResponse(result.response.text(), menuItems);
      reply = parsed.reply;
      recommendedItems = parsed.recommendedItems;
      suggestedChips = parsed.suggestedChips;
      memoryUpdate = parsed.memoryUpdate;
    }

    // 3. Update guest memory & persist conversation
    if (mongoose.connection.readyState === 1 && convo.save) {
      // Apply memory updates
      if (memoryUpdate && Object.keys(memoryUpdate).length) {
        convo.guestMemory = { ...guestMemory, ...memoryUpdate };
      }
      convo.messages.push({ role: 'user', content: message });
      convo.messages.push({ role: 'model', content: reply });
      // Keep last 40 messages
      if (convo.messages.length > 40) convo.messages = convo.messages.slice(-40);
      convo.markModified('guestMemory');
      await convo.save();
    }

    res.json({ reply, recommendedItems, suggestedChips, guestMemory: { ...guestMemory, ...memoryUpdate } });

  } catch (error) {
    console.error('Chat error:', error.message);
    res.json({
      reply: "I sincerely apologize — I'm having a brief moment of technical difficulty. Please allow me a moment and try again.",
      recommendedItems: [],
      suggestedChips: ['Try again', 'View Menu', 'Book a Table'],
      guestMemory: {}
    });
  }
});

export default router;
