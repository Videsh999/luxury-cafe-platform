import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AudioContext } from '../context/AudioContext';

const CartSidebar = () => {
  const { cart, removeFromCart, updateQuantity, isCartOpen, setIsCartOpen } = useContext(CartContext);
  const { playSFX } = useContext(AudioContext);
  const navigate = useNavigate();
  
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1000]"
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-[480px] bg-luxury-dark/95 backdrop-blur-3xl z-[1001] border-l border-white/5 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-10 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-serif text-white tracking-tight">Your Selection</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-luxury-gold animate-pulse" />
                  <p className="text-[9px] uppercase tracking-[0.4em] text-white/30 font-black">Private Order Reservation</p>
                </div>
              </div>
              <motion.button
                whileHover={{ rotate: 90, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsCartOpen(false)}
                className="p-4 bg-white/5 rounded-full text-white/30 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-10">
              <AnimatePresence mode="popLayout">
                {cart.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center space-y-8"
                  >
                    <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/5 relative">
                       <ShoppingBag size={40} className="text-white/10" />
                       <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="absolute inset-0 bg-luxury-gold/10 rounded-full blur-xl" 
                       />
                    </div>
                    <div>
                      <p className="text-white font-serif italic text-2xl tracking-wide">The menu awaits your choice.</p>
                      <p className="text-white/30 text-[10px] uppercase tracking-[0.2em] mt-3">Select from our curated collections</p>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setIsCartOpen(false)}
                      className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] uppercase tracking-[0.3em] text-white font-black hover:bg-white hover:text-black transition-all"
                    >
                      Return to Menu
                    </motion.button>
                  </motion.div>
                ) : (
                  <div className="space-y-10">
                    {cart.map((item, idx) => {
                      const itemImage = item.images?.[0] || item.image || 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=800';
                      
                      return (
                      <motion.div
                        key={item._id}
                        layout
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 30, scale: 0.95 }}
                        transition={{ delay: idx * 0.1, duration: 0.6, ease: [0.6, 0.05, 0.01, 0.9] }}
                        className="flex gap-8 group"
                      >
                        <div className="relative h-32 w-32 rounded-3xl overflow-hidden border border-white/10 flex-shrink-0 bg-black/50">
                          <img 
                            src={itemImage} 
                            alt={item.name} 
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=800'; }}
                            className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-20 transition-opacity" />
                        </div>
                        
                        <div className="flex-1 flex flex-col justify-between py-2">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <h4 className="text-white font-serif text-xl tracking-tight leading-tight">{item.name}</h4>
                              <button 
                                onClick={() => { removeFromCart(item._id); playSFX('click'); }}
                                className="p-2 text-white/10 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <p className="text-[11px] uppercase tracking-[0.2em] text-luxury-gold font-black">₹{item.price.toLocaleString('en-IN')}</p>
                          </div>
                          
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center bg-white/5 rounded-2xl border border-white/10 p-1.5 shadow-inner">
                              <motion.button 
                                whileTap={{ scale: 0.8 }}
                                onClick={() => { updateQuantity(item._id, item.quantity - 1); playSFX('click'); }}
                                className="w-8 h-8 rounded-xl flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all"
                              >
                                <Minus size={14} />
                              </motion.button>
                              <span className="text-sm text-white font-bold w-10 text-center font-mono italic">{item.quantity}</span>
                              <motion.button 
                                whileTap={{ scale: 0.8 }}
                                onClick={() => { updateQuantity(item._id, item.quantity + 1); playSFX('click'); }}
                                className="w-8 h-8 rounded-xl flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all"
                              >
                                <Plus size={14} />
                              </motion.button>
                            </div>
                            <span className="text-white font-display text-lg tracking-tighter">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </motion.div>
                      );
                    })}
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-10 bg-black/40 border-t border-white/5 space-y-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-luxury-gold/30 to-transparent" />
                
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <span className="text-white/20 text-[9px] uppercase tracking-[0.4em] font-black block">Settlement Value</span>
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={12} className="text-luxury-gold" />
                      <span className="text-[10px] text-white/40 uppercase tracking-widest">Premium Checkout</span>
                    </div>
                  </div>
                  <span className="text-4xl font-display text-white tracking-tighter italic">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(197, 160, 89, 0.4)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    try { playSFX('success'); } catch (_) {}
                    setIsCartOpen(false);
                    navigate('/checkout');
                  }}
                  className="w-full py-6 bg-luxury-gold text-black rounded-[2rem] text-xs font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 shadow-2xl relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  Proceed to Checkout <ArrowRight size={18} />
                </motion.button>
                
                <p className="text-[9px] text-center text-white/10 uppercase tracking-[0.5em] font-black">Encrypted • Exclusive • Exemplary</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;
