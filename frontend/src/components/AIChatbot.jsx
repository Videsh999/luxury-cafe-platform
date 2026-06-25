import React, { useState, useRef, useEffect, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Plus, CheckCircle2, ChevronRight, Brain } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { CartContext } from '../context/CartContext';
import { AudioContext } from '../context/AudioContext';

// ── Persistent session ID ────────────────────────────────────────────────────
function getSessionId() {
  let id = localStorage.getItem('aura_chat_session');
  if (!id) {
    id = 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('aura_chat_session', id);
  }
  return id;
}

// ── Word-by-word streaming animation ────────────────────────────────────────
const StreamingText = ({ text, onDone }) => {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    indexRef.current = 0;
    const words = text.split(' ');
    const interval = setInterval(() => {
      if (indexRef.current < words.length) {
        setDisplayed(words.slice(0, indexRef.current + 1).join(' '));
        indexRef.current++;
      } else {
        clearInterval(interval);
        setDone(true);
        onDone?.();
      }
    }, 28);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <ReactMarkdown>
      {displayed + (!done ? '▍' : '')}
    </ReactMarkdown>
  );
};

// ── Recommendation Card ──────────────────────────────────────────────────────
const RecommendCard = ({ item, onAdd }) => {
  const [added, setAdded] = useState(false);
  const img = item.images?.[0] || item.image || 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=400';

  const handleAdd = (e) => {
    e.stopPropagation();
    onAdd(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.3 }}
      className="w-56 flex-shrink-0 bg-black/60 border border-luxury-gold/20 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
    >
      <div className="h-28 relative overflow-hidden">
        <img src={img} alt={item.name} onError={e => { e.target.src = 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=400'; }} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
        <span className="absolute bottom-2 left-3 text-luxury-gold font-serif text-base">₹{item.price}</span>
        {item.dietaryPreference && (
          <span className={`absolute top-2 right-2 w-3.5 h-3.5 rounded-full border flex items-center justify-center ${item.dietaryPreference === 'Veg' ? 'border-green-500/60 bg-black/60' : item.dietaryPreference === 'Vegan' ? 'border-green-400/60 bg-black/60' : 'border-red-500/60 bg-black/60'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${item.dietaryPreference === 'Non-Veg' ? 'bg-red-500' : 'bg-green-500'}`} />
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-white/40 text-[8px] uppercase tracking-widest mb-0.5">{item.category}</p>
        <p className="text-white font-medium text-xs leading-snug mb-2 line-clamp-2">{item.name}</p>
        <button
          onClick={handleAdd}
          className={`w-full py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 ${added ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-luxury-gold text-black hover:bg-white'}`}
        >
          {added ? <><CheckCircle2 size={11} /> Added</> : <><Plus size={11} /> Add to Cart</>}
        </button>
      </div>
    </motion.div>
  );
};

// ── Memory Badge ─────────────────────────────────────────────────────────────
const MemoryBadge = ({ memory }) => {
  if (!memory?.name && !memory?.dietaryPreference) return null;
  return (
    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-1.5 bg-luxury-gold/10 border border-luxury-gold/20 rounded-full px-3 py-1 text-[9px] text-luxury-gold/80 font-bold uppercase tracking-widest"
    >
      <Brain size={9} className="text-luxury-gold" />
      {memory.name && <span>{memory.name}</span>}
      {memory.dietaryPreference && <span>· {memory.dietaryPreference}</span>}
      {memory.favoriteDrinks?.[0] && <span>· {memory.favoriteDrinks[0]}</span>}
    </motion.div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const AIChatbot = () => {
  const SESSION_ID = getSessionId();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{
    role: 'model',
    content: "Welcome to **Aura Reserve**. I'm your personal concierge — here to guide you through our menu, arrange reservations, and curate a perfect experience. How may I assist you today?",
    timestamp: Date.now(),
    isNew: false,
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chips, setChips] = useState(['Best Coffee', 'Chef Specials', 'Book VIP Table', 'Vegan Options', 'Romantic Dinner']);
  const [guestMemory, setGuestMemory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('aura_guest_memory') || '{}'); } catch { return {}; }
  });

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const { addToCart } = useContext(CartContext) || {};
  const { playSFX } = useContext(AudioContext) || {};

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  // Persist guest memory locally
  useEffect(() => {
    if (Object.keys(guestMemory).length) {
      localStorage.setItem('aura_guest_memory', JSON.stringify(guestMemory));
    }
  }, [guestMemory]);

  const handleSend = useCallback(async (messageText) => {
    const text = (messageText || input).trim();
    if (!text || isLoading) return;

    const userMsg = { role: 'user', content: text, timestamp: Date.now(), isNew: false };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const cleanHistory = messages.slice(-14).map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('http://localhost:5001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: cleanHistory, sessionId: SESSION_ID }),
      });

      const data = await res.json();

      // Update guest memory
      if (data.guestMemory && Object.keys(data.guestMemory).length) {
        setGuestMemory(prev => ({ ...prev, ...data.guestMemory }));
      }

      // Update chips
      if (data.suggestedChips?.length) setChips(data.suggestedChips);

      setMessages(prev => [...prev, {
        role: 'model',
        content: data.reply,
        recommendedItems: data.recommendedItems || [],
        timestamp: Date.now(),
        isNew: true,
      }]);
      playSFX?.('notification');
    } catch {
      setMessages(prev => [...prev, {
        role: 'model',
        content: "I sincerely apologize — I'm having a brief connection issue. Please try again in a moment.",
        timestamp: Date.now(),
        isNew: false,
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, messages, isLoading, SESSION_ID]);

  const handleChipClick = (chip) => {
    playSFX?.('click');
    handleSend(chip);
  };

  const handleAddToCart = (item) => {
    addToCart?.(item, 1);
    playSFX?.('cart');
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSend();
  };

  return (
    <>
      {/* ── Floating Orb ─────────────────────────────────────────────────── */}
      <div style={{ position: 'fixed', bottom: '32px', right: '32px', zIndex: 999999 }} className="group/orb">
        <AnimatePresence>
          {!isOpen && (
            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }} className="relative flex items-center justify-center">
              {/* Tooltip */}
              <div className="absolute right-full mr-5 top-1/2 -translate-y-1/2 opacity-0 group-hover/orb:opacity-100 transition-all duration-500 pointer-events-none whitespace-nowrap">
                <div className="bg-black/70 backdrop-blur-xl border border-white/10 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-luxury-gold animate-pulse" />
                  <span className="text-[10px] uppercase tracking-widest text-white/80 font-bold">
                    {guestMemory?.name ? `Welcome back, ${guestMemory.name}` : 'Ask AI Concierge'}
                  </span>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
                onClick={() => { setIsOpen(true); playSFX?.('click'); }}
                className="relative w-[72px] h-[72px] rounded-full flex items-center justify-center shadow-[0_10px_40px_rgba(0,0,0,0.6)] cursor-pointer"
              >
                <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }} className="absolute inset-[-25%] rounded-full bg-luxury-gold/20 blur-[18px]" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#1a1205] via-[#4a3412] to-luxury-gold border border-luxury-gold/50 shadow-[inset_0_-8px_20px_rgba(0,0,0,0.8),0_0_25px_rgba(197,160,89,0.5)] group-hover/orb:shadow-[0_0_50px_rgba(197,160,89,0.7)] transition-all duration-700 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-full opacity-50 transform -rotate-45 scale-150 translate-y-[-50%]" />
                </div>
                <Sparkles size={24} className="relative z-10 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Chat Window ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 30, scale: 0.95, filter: 'blur(8px)' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            style={{
              position: 'fixed',
              bottom: window.innerWidth > 640 ? '104px' : '0',
              right: window.innerWidth > 640 ? '24px' : '0',
              zIndex: 999999,
              width: window.innerWidth > 640 ? '400px' : '100%',
              height: window.innerWidth > 640 ? '620px' : '88vh',
              maxHeight: '88vh',
            }}
            className="flex flex-col border border-luxury-gold/20 sm:rounded-[28px] rounded-t-[28px] overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.7)]"
          >
            {/* Glass background */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-3xl -z-10" />

            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="bg-black/50 px-5 py-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-11 h-11 rounded-full bg-luxury-gold/10 flex items-center justify-center border border-luxury-gold/30">
                    <Sparkles size={18} className="text-luxury-gold" />
                  </div>
                  <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 rounded-full bg-luxury-gold/20 pointer-events-none" />
                </div>
                <div>
                  <h3 className="text-white font-serif tracking-[0.15em] text-sm uppercase">Aura Concierge</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                    <span className="text-white/40 text-[9px] uppercase tracking-widest font-semibold">Online — Luxury AI</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MemoryBadge memory={guestMemory} />
                <button onClick={() => { setIsOpen(false); playSFX?.('click'); }} className="w-9 h-9 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* ── Messages ───────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
              <AnimatePresence initial={false}>
                {messages.map((msg, idx) => {
                  const timeStr = new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const isLastModel = msg.role === 'model' && idx === messages.length - 1;

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm shadow-lg relative ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-luxury-gold to-[#c5a059] text-black rounded-tr-none font-medium'
                          : 'bg-white/[0.06] text-white/90 border border-white/10 rounded-tl-none font-light prose prose-invert prose-sm max-w-none prose-p:my-1 prose-p:leading-relaxed'
                      }`}>
                        {msg.role === 'user' ? msg.content : (
                          msg.isNew && isLastModel
                            ? <StreamingText text={msg.content} onDone={() => setMessages(prev => prev.map((m, i) => i === idx ? { ...m, isNew: false } : m))} />
                            : <ReactMarkdown>{msg.content}</ReactMarkdown>
                        )}
                      </div>

                      <span className={`text-[9px] text-white/25 mt-1.5 uppercase tracking-wider font-semibold ${msg.role === 'user' ? 'mr-1' : 'ml-1'}`}>
                        {timeStr}
                      </span>

                      {/* Recommendation Cards */}
                      {msg.recommendedItems?.length > 0 && (
                        <div className="flex gap-3 mt-3 overflow-x-auto pb-1 hide-scrollbar max-w-[340px]">
                          {msg.recommendedItems.map((item, i) => (
                            <RecommendCard key={item._id || i} item={item} onAdd={handleAddToCart} />
                          ))}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Loading dots */}
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start">
                  <div className="bg-white/[0.06] border border-white/10 rounded-2xl rounded-tl-none px-4 py-3.5 flex items-center gap-1.5">
                    {[0, 0.2, 0.4].map((d, i) => (
                      <motion.span key={i} animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }} transition={{ duration: 0.7, repeat: Infinity, delay: d }} className="w-1.5 h-1.5 bg-luxury-gold rounded-full" />
                    ))}
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ── Suggestion Chips ────────────────────────────────────────── */}
            <div className="px-4 py-2.5 border-t border-white/5 flex gap-2 overflow-x-auto hide-scrollbar flex-shrink-0 bg-black/30">
              {chips.slice(0, 5).map((chip) => (
                <motion.button
                  key={chip}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleChipClick(chip)}
                  disabled={isLoading}
                  className="whitespace-nowrap flex-shrink-0 flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-[9px] uppercase tracking-widest hover:border-luxury-gold/60 hover:text-luxury-gold transition-all duration-300 disabled:opacity-40"
                >
                  <ChevronRight size={9} className="flex-shrink-0" />
                  {chip}
                </motion.button>
              ))}
            </div>

            {/* ── Input ───────────────────────────────────────────────────── */}
            <form onSubmit={handleFormSubmit} className="p-4 bg-black/60 flex gap-2.5 border-t border-white/10 flex-shrink-0">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={guestMemory?.name ? `Ask me anything, ${guestMemory.name}…` : 'Ask Aura anything…'}
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-luxury-gold/50 transition-all placeholder:text-white/30"
              />
              <motion.button
                whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-12 h-12 rounded-2xl bg-luxury-gold text-black flex items-center justify-center disabled:opacity-40 transition-all shadow-[0_0_20px_rgba(197,160,89,0.3)] flex-shrink-0"
              >
                <Send size={18} className="ml-0.5" />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatbot;
