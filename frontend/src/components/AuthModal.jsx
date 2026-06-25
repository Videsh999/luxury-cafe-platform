import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Lock, User, Mail, ArrowRight } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { AudioContext } from '../context/AudioContext';

const AuthModal = ({ isOpen, onClose }) => {
  const { login } = useContext(AuthContext);
  const { playSFX } = useContext(AudioContext);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    playSFX('click');
    
    if (isLogin) {
      const res = await login(email, password);
      if (res.success) {
        playSFX('success');
        onClose();
      } else {
        setError(res.message);
      }
    } else {
      // Mock signup
      try {
        const res = await fetch('http://localhost:5001/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });
        if (res.ok) {
          playSFX('success');
          setIsLogin(true);
          setError('Access granted. Please verify your credentials.');
        } else {
          const data = await res.json();
          setError(data.message || 'Validation failed');
        }
      } catch (err) {
        setError('Connection interrupted');
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative bg-luxury-dark/80 backdrop-blur-3xl border border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.5)] rounded-[2.5rem] w-full max-w-lg p-12 overflow-hidden"
          >
            {/* Animated Glow Overlay */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-luxury-gold/10 rounded-full blur-[80px]" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-luxury-gold/5 rounded-full blur-[80px]" />

            <button onClick={onClose} className="absolute top-8 right-8 text-white/20 hover:text-white transition-all">
              <X size={24} />
            </button>

            <div className="relative z-10 text-center space-y-4 mb-12">
               <motion.div 
                initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-luxury-gold/10 border border-luxury-gold/20"
               >
                 <ShieldCheck size={12} className="text-luxury-gold" />
                 <span className="text-[9px] uppercase tracking-[0.3em] font-black text-luxury-gold">Secure Member Access</span>
               </motion.div>
               
               <h2 className="text-4xl font-serif text-white tracking-tight italic">
                 {isLogin ? 'Welcome Back' : 'Private Registry'}
               </h2>
               <p className="text-white/30 text-sm font-light tracking-wide max-w-[80%] mx-auto">
                 {isLogin ? 'Synchronize your profile for a personalized hospitality journey.' : 'Request access to the Aura Reserve inner circle for exclusive benefits.'}
               </p>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                className="mb-8 p-4 bg-red-500/5 border border-red-500/20 text-red-400 text-[10px] uppercase tracking-widest font-black rounded-2xl text-center"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="relative group"
                  >
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-luxury-gold transition-colors" size={18} />
                    <input 
                      type="text" 
                      placeholder="FULL NAME"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-xs tracking-[0.2em] font-bold text-white focus:outline-none focus:border-luxury-gold/50 focus:bg-white/10 transition-all placeholder:text-white/40"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-luxury-gold transition-colors" size={18} />
                <input 
                  type="email" 
                  placeholder="EMAIL ADDRESS"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-xs tracking-[0.2em] font-bold text-white focus:outline-none focus:border-luxury-gold/50 focus:bg-white/10 transition-all placeholder:text-white/40"
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-luxury-gold transition-colors" size={18} />
                <input 
                  type="password" 
                  placeholder="SECURITY PIN"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-xs tracking-[0.2em] font-bold text-white focus:outline-none focus:border-luxury-gold/50 focus:bg-white/10 transition-all placeholder:text-white/40"
                />
              </div>

              <motion.button 
                whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(197, 160, 89, 0.2)' }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                className="w-full bg-luxury-gold text-black text-[10px] font-black uppercase tracking-[0.3em] py-5 rounded-[2rem] hover:bg-white transition-all mt-8 flex items-center justify-center gap-4 group"
              >
                {isLogin ? 'Synchronize Profile' : 'Request Registry'}
                <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
              </motion.button>
            </form>

            <div className="mt-10 text-center relative z-10">
              <button 
                onClick={() => { setIsLogin(!isLogin); setError(''); playSFX('click'); }}
                className="text-white/60 hover:text-luxury-gold text-[9px] uppercase tracking-[0.3em] font-black transition-all"
              >
                {isLogin ? "Join the Inner Circle" : "Return to Access Portal"}
              </button>
            </div>
            
            <p className="mt-8 text-center text-[8px] text-white/40 uppercase tracking-[0.5em] font-black">Private Identity Service • Encrypted Session</p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
