import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Plus, Trash2, Send, Brain, MessageSquare, Sparkles, RefreshCw } from 'lucide-react';

const API = 'http://localhost:5001/api/chat';

const Section = ({ title, children }) => (
  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
    <h3 className="text-luxury-gold font-serif tracking-widest text-sm uppercase">{title}</h3>
    {children}
  </div>
);

const Input = (props) => (
  <input {...props} className={`w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-luxury-gold/50 placeholder:text-white/30 transition-colors ${props.className || ''}`} />
);

const Textarea = (props) => (
  <textarea {...props} className={`w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-luxury-gold/50 placeholder:text-white/30 transition-colors resize-none ${props.className || ''}`} />
);

export default function ChatbotTraining() {
  const [knowledge, setKnowledge] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [testMsg, setTestMsg] = useState('');
  const [testReply, setTestReply] = useState('');
  const [testing, setTesting] = useState(false);
  const [activeTab, setActiveTab] = useState('knowledge');

  useEffect(() => { fetchKnowledge(); fetchConversations(); }, []);

  const fetchKnowledge = async () => {
    try {
      const res = await fetch(`${API}/knowledge`);
      setKnowledge(await res.json());
    } catch { console.error('Failed to load knowledge'); }
  };

  const fetchConversations = async () => {
    try {
      const res = await fetch(`${API}/conversations`);
      setConversations(await res.json());
    } catch { setConversations([]); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`${API}/knowledge`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(knowledge) });
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } catch { alert('Save failed'); }
    setSaving(false);
  };

  const handleTest = async () => {
    if (!testMsg.trim()) return;
    setTesting(true); setTestReply('');
    try {
      const res = await fetch(`${API}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: testMsg, history: [], sessionId: 'admin_test' }) });
      const data = await res.json();
      setTestReply(data.reply || 'No reply received.');
    } catch { setTestReply('Connection error.'); }
    setTesting(false);
  };

  const addFAQ = () => setKnowledge(k => ({ ...k, customFAQs: [...(k.customFAQs || []), { question: '', answer: '' }] }));
  const removeFAQ = (i) => setKnowledge(k => ({ ...k, customFAQs: k.customFAQs.filter((_, idx) => idx !== i) }));
  const updateFAQ = (i, field, val) => setKnowledge(k => ({ ...k, customFAQs: k.customFAQs.map((faq, idx) => idx === i ? { ...faq, [field]: val } : faq) }));

  const addPromo = () => setKnowledge(k => ({ ...k, activePromotions: [...(k.activePromotions || []), { title: '', description: '', validUntil: '' }] }));
  const removePromo = (i) => setKnowledge(k => ({ ...k, activePromotions: k.activePromotions.filter((_, idx) => idx !== i) }));
  const updatePromo = (i, field, val) => setKnowledge(k => ({ ...k, activePromotions: k.activePromotions.map((p, idx) => idx === i ? { ...p, [field]: val } : p) }));

  const addPairing = () => setKnowledge(k => ({ ...k, pairingSuggestions: [...(k.pairingSuggestions || []), { item: '', pairWith: '', reason: '' }] }));
  const removePairing = (i) => setKnowledge(k => ({ ...k, pairingSuggestions: k.pairingSuggestions.filter((_, idx) => idx !== i) }));
  const updatePairing = (i, field, val) => setKnowledge(k => ({ ...k, pairingSuggestions: k.pairingSuggestions.map((p, idx) => idx === i ? { ...p, [field]: val } : p) }));

  const tabs = [
    { id: 'knowledge', label: 'Knowledge', icon: Brain },
    { id: 'faqs', label: 'FAQs', icon: MessageSquare },
    { id: 'promos', label: 'Promotions', icon: Sparkles },
    { id: 'pairings', label: 'Pairings', icon: Sparkles },
    { id: 'test', label: 'Test AI', icon: Send },
    { id: 'logs', label: 'Conversations', icon: MessageSquare },
  ];

  if (!knowledge) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-white">AI Concierge Training</h1>
          <p className="text-white/40 text-sm mt-1">Shape Aura's personality, knowledge, and responses</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-luxury-gold text-black px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white transition-all disabled:opacity-60">
          <Save size={15} /> {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === id ? 'bg-luxury-gold text-black' : 'bg-white/5 text-white/50 hover:text-white border border-white/10'}`}>
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* ── Knowledge Tab ── */}
      {activeTab === 'knowledge' && (
        <div className="space-y-4">
          <Section title="Café Story">
            <Textarea rows={4} value={knowledge.cafeStory || ''} onChange={e => setKnowledge(k => ({ ...k, cafeStory: e.target.value }))} placeholder="Describe Aura Reserve's story, philosophy, and ambience…" />
          </Section>
          <Section title="VIP Dining Rules">
            <Textarea rows={3} value={knowledge.vipDiningRules || ''} onChange={e => setKnowledge(k => ({ ...k, vipDiningRules: e.target.value }))} placeholder="VIP table policies, exclusive packages, complimentary offerings…" />
          </Section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Section title="Opening Hours">
              <Input value={knowledge.openingHours || ''} onChange={e => setKnowledge(k => ({ ...k, openingHours: e.target.value }))} placeholder="Mon–Sun: 8:00 AM – 11:00 PM" />
            </Section>
            <Section title="Location">
              <Input value={knowledge.location || ''} onChange={e => setKnowledge(k => ({ ...k, location: e.target.value }))} placeholder="Full address…" />
            </Section>
          </div>
          <Section title="Allergen & Dietary Policy">
            <Textarea rows={3} value={knowledge.allergenInfo || ''} onChange={e => setKnowledge(k => ({ ...k, allergenInfo: e.target.value }))} placeholder="How you handle dietary restrictions, allergies, customizations…" />
          </Section>
          <Section title="AI Personality Traits">
            <Input value={knowledge.personalityTraits || ''} onChange={e => setKnowledge(k => ({ ...k, personalityTraits: e.target.value }))} placeholder="Elegant, warm, knowledgeable, sophisticated…" />
          </Section>
          <Section title="Warmth / Tone Level">
            <div className="flex items-center gap-4">
              <span className="text-white/40 text-xs uppercase tracking-widest">Formal</span>
              <input type="range" min="1" max="10" value={knowledge.toneLevel || 7} onChange={e => setKnowledge(k => ({ ...k, toneLevel: Number(e.target.value) }))} className="flex-1 accent-luxury-gold" />
              <span className="text-white/40 text-xs uppercase tracking-widest">Warm</span>
              <span className="text-luxury-gold font-bold text-sm w-6 text-center">{knowledge.toneLevel || 7}</span>
            </div>
          </Section>
        </div>
      )}

      {/* ── FAQs Tab ── */}
      {activeTab === 'faqs' && (
        <Section title="Custom FAQs">
          <p className="text-white/40 text-xs">The AI will use these to answer common questions accurately.</p>
          <div className="space-y-4">
            {(knowledge.customFAQs || []).map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-black/30 border border-white/10 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white/30 text-[10px] uppercase tracking-widest font-bold">FAQ #{i + 1}</span>
                  <button onClick={() => removeFAQ(i)} className="text-red-400/60 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                </div>
                <Input value={faq.question} onChange={e => updateFAQ(i, 'question', e.target.value)} placeholder="Question customers ask…" />
                <Textarea rows={2} value={faq.answer} onChange={e => updateFAQ(i, 'answer', e.target.value)} placeholder="The ideal answer from Aura…" />
              </motion.div>
            ))}
            <button onClick={addFAQ} className="w-full py-3 border border-dashed border-white/20 rounded-xl text-white/40 hover:text-luxury-gold hover:border-luxury-gold/40 transition-all text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
              <Plus size={14} /> Add FAQ
            </button>
          </div>
        </Section>
      )}

      {/* ── Promotions Tab ── */}
      {activeTab === 'promos' && (
        <Section title="Active Promotions">
          <p className="text-white/40 text-xs">Aura will naturally mention these when relevant.</p>
          <div className="space-y-4">
            {(knowledge.activePromotions || []).map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-black/30 border border-white/10 rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/30 text-[10px] uppercase tracking-widest font-bold">Promo #{i + 1}</span>
                  <button onClick={() => removePromo(i)} className="text-red-400/60 hover:text-red-400"><Trash2 size={14} /></button>
                </div>
                <Input value={p.title} onChange={e => updatePromo(i, 'title', e.target.value)} placeholder="Promo title (e.g. Happy Hour)" />
                <Textarea rows={2} value={p.description} onChange={e => updatePromo(i, 'description', e.target.value)} placeholder="Details of the promotion…" />
                <Input value={p.validUntil} onChange={e => updatePromo(i, 'validUntil', e.target.value)} placeholder="Valid until (e.g. 31 May 2026)" />
              </motion.div>
            ))}
            <button onClick={addPromo} className="w-full py-3 border border-dashed border-white/20 rounded-xl text-white/40 hover:text-luxury-gold hover:border-luxury-gold/40 transition-all text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
              <Plus size={14} /> Add Promotion
            </button>
          </div>
        </Section>
      )}

      {/* ── Pairings Tab ── */}
      {activeTab === 'pairings' && (
        <Section title="Curated Pairings">
          <p className="text-white/40 text-xs">Aura will suggest these premium combinations to guests.</p>
          <div className="space-y-4">
            {(knowledge.pairingSuggestions || []).map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-black/30 border border-white/10 rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/30 text-[10px] uppercase tracking-widest font-bold">Pairing #{i + 1}</span>
                  <button onClick={() => removePairing(i)} className="text-red-400/60 hover:text-red-400"><Trash2 size={14} /></button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input value={p.item} onChange={e => updatePairing(i, 'item', e.target.value)} placeholder="Item (e.g. Golden Espresso)" />
                  <Input value={p.pairWith} onChange={e => updatePairing(i, 'pairWith', e.target.value)} placeholder="Pair with (e.g. Almond Croissant)" />
                </div>
                <Input value={p.reason} onChange={e => updatePairing(i, 'reason', e.target.value)} placeholder="Why they pair well…" />
              </motion.div>
            ))}
            <button onClick={addPairing} className="w-full py-3 border border-dashed border-white/20 rounded-xl text-white/40 hover:text-luxury-gold hover:border-luxury-gold/40 transition-all text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
              <Plus size={14} /> Add Pairing
            </button>
          </div>
        </Section>
      )}

      {/* ── Test Console Tab ── */}
      {activeTab === 'test' && (
        <Section title="Live AI Test Console">
          <p className="text-white/40 text-xs mb-2">Send a message and see exactly how Aura responds with the current training data.</p>
          <div className="flex gap-3">
            <input value={testMsg} onChange={e => setTestMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleTest()}
              placeholder="e.g. I'm vegetarian, what do you recommend?" className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-luxury-gold/50 placeholder:text-white/30" />
            <button onClick={handleTest} disabled={testing || !testMsg.trim()} className="px-5 py-3 bg-luxury-gold text-black rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50 flex items-center gap-2">
              {testing ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
              {testing ? 'Asking…' : 'Ask Aura'}
            </button>
          </div>
          {testReply && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 bg-black/40 border border-luxury-gold/20 rounded-xl p-4">
              <p className="text-white/30 text-[9px] uppercase tracking-widest font-bold mb-2">Aura's Response</p>
              <p className="text-white/85 text-sm leading-relaxed whitespace-pre-wrap">{testReply}</p>
            </motion.div>
          )}
          <div className="mt-4">
            <p className="text-white/30 text-[9px] uppercase tracking-widest font-bold mb-3">Quick Test Phrases</p>
            <div className="flex flex-wrap gap-2">
              {['I am vegetarian', 'Recommend best coffee', 'I want a romantic dinner', 'What are your hours?', 'Any allergen-free options?', 'Chef Specials today?'].map(q => (
                <button key={q} onClick={() => { setTestMsg(q); }} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white/50 text-xs hover:text-luxury-gold hover:border-luxury-gold/30 transition-all">
                  {q}
                </button>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* ── Conversation Logs Tab ── */}
      {activeTab === 'logs' && (
        <Section title="Recent Conversation Logs">
          <div className="flex justify-between items-center">
            <p className="text-white/40 text-xs">{conversations.length} sessions stored</p>
            <button onClick={fetchConversations} className="flex items-center gap-1.5 text-white/40 hover:text-luxury-gold text-xs transition-colors">
              <RefreshCw size={12} /> Refresh
            </button>
          </div>
          {conversations.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-8">No conversations yet.</p>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
              {conversations.map((convo, i) => (
                <div key={i} className="bg-black/30 border border-white/10 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-luxury-gold text-[10px] font-bold uppercase tracking-widest">{convo.sessionId?.slice(0, 16)}…</span>
                    <span className="text-white/30 text-[9px]">{new Date(convo.updatedAt).toLocaleDateString()}</span>
                  </div>
                  {convo.guestMemory?.name && (
                    <div className="flex gap-2 flex-wrap">
                      {convo.guestMemory.name && <span className="text-[9px] bg-luxury-gold/10 text-luxury-gold px-2 py-0.5 rounded-full border border-luxury-gold/20">👤 {convo.guestMemory.name}</span>}
                      {convo.guestMemory.dietaryPreference && <span className="text-[9px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20">{convo.guestMemory.dietaryPreference}</span>}
                      {convo.guestMemory.favoriteDrinks?.[0] && <span className="text-[9px] bg-white/5 text-white/50 px-2 py-0.5 rounded-full border border-white/10">☕ {convo.guestMemory.favoriteDrinks[0]}</span>}
                    </div>
                  )}
                  <p className="text-white/40 text-xs">{convo.messages?.length || 0} messages</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {(convo.messages || []).slice(-4).map((msg, j) => (
                      <div key={j} className={`text-xs truncate ${msg.role === 'user' ? 'text-white/60' : 'text-white/30'}`}>
                        <span className="font-bold">{msg.role === 'user' ? '👤' : '✨'}</span> {msg.content?.slice(0, 80)}{msg.content?.length > 80 ? '…' : ''}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>
      )}
    </div>
  );
}
