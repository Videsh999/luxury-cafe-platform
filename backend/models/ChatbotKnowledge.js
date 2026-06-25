import mongoose from 'mongoose';

const ChatbotKnowledgeSchema = new mongoose.Schema({
  cafeStory: {
    type: String,
    default: 'Aura Reserve is an ultra-luxury fine dining cafe offering a cinematic ambiance, artisan-crafted coffees, and a serene sanctuary from the bustling world. Every detail — from our hand-picked ingredients to our velvet seating — is curated for an extraordinary experience.'
  },
  vipDiningRules: {
    type: String,
    default: 'VIP Private Tables and exclusive Romantic Dining Packages are available. Reservations are strongly recommended. VIP guests receive a complimentary chef\'s appetizer and priority seating.'
  },
  openingHours: {
    type: String,
    default: 'Monday – Sunday: 8:00 AM – 11:00 PM. Last orders accepted at 10:30 PM.'
  },
  location: {
    type: String,
    default: '42 Velvet Lane, Jubilee Hills, Hyderabad, Telangana 500033'
  },
  allergenInfo: {
    type: String,
    default: 'We accommodate all major dietary requirements including gluten-free, nut-free, dairy-free, and vegan. Please inform our team of any allergies — our kitchen will customize your order.'
  },
  specialEvents: [{ type: String }],
  activePromotions: [{
    title: { type: String },
    description: { type: String },
    validUntil: { type: String }
  }],
  pairingSuggestions: [{
    item: { type: String },
    pairWith: { type: String },
    reason: { type: String }
  }],
  customFAQs: [{
    question: { type: String, required: true },
    answer: { type: String, required: true }
  }],
  personalityTraits: {
    type: String,
    default: 'Elegant, warm, deeply knowledgeable, sophisticated, attentive, never robotic.'
  },
  toneLevel: { type: Number, default: 7, min: 1, max: 10 } // 1=very formal, 10=very casual/warm
}, { timestamps: true });

export default mongoose.model('ChatbotKnowledge', ChatbotKnowledgeSchema);
