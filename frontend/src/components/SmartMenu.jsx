import React, { useState, useEffect, useContext, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Search, UtensilsCrossed, Clock, Star, Flame, Leaf, Plus, Minus, Heart, X, ChevronLeft, ChevronRight, ShoppingBag, MapPin, Phone, LayoutGrid, List, Home, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AudioContext } from '../context/AudioContext';

// --- Cinematic Image ---
const CinematicImage = ({ src, alt, className }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const fallbackSrc = 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=800';

  return (
    <div className={`relative overflow-hidden bg-black/80 ${className}`}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0">
          <div className="w-full h-full animate-pulse bg-gradient-to-r from-white/5 via-white/10 to-white/5" />
        </div>
      )}
      <img
        src={hasError ? fallbackSrc : src}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        onError={() => { setHasError(true); setIsLoaded(true); }}
        className={`w-full h-full object-cover transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
};

// --- Toast Component ---
const LuxuryToast = ({ message, visible }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-black/80 backdrop-blur-xl border border-luxury-gold/50 text-white px-8 py-4 rounded-full shadow-[0_0_40px_rgba(197,160,89,0.3)] flex items-center gap-3"
      >
        <Star size={16} className="text-luxury-gold fill-luxury-gold animate-pulse" />
        <span className="font-sans text-sm tracking-widest uppercase">{message}</span>
      </motion.div>
    )}
  </AnimatePresence>
);

// --- Item Details Modal ---
const ItemDetailsModal = ({ item, onClose, onAddToCart }) => {
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const images = item.images && item.images.length > 0 ? item.images : [item.image || 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=800'];
  const nextImage = () => setCurrentImageIdx((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImageIdx((prev) => (prev - 1 + images.length) % images.length);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <motion.div
        initial={{ y: 50, scale: 0.95, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 20, scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-5xl bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col md:flex-row max-h-[90vh]"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-20 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all border border-white/10"
        >
          <X size={20} />
        </button>

        {/* Left: Image Carousel */}
        <div className="w-full md:w-1/2 relative h-64 md:h-auto min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div key={currentImageIdx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="absolute inset-0">
              <CinematicImage src={images[currentImageIdx]} alt={`${item.name} - ${currentImageIdx + 1}`} className="w-full h-full" />
            </motion.div>
          </AnimatePresence>
          {images.length > 1 && (
            <>
              <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors border border-white/10"><ChevronLeft size={20} /></button>
              <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors border border-white/10"><ChevronRight size={20} /></button>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, idx) => (
                  <button key={idx} onClick={() => setCurrentImageIdx(idx)} className={`w-2 h-2 rounded-full transition-all duration-300 ${currentImageIdx === idx ? 'w-6 bg-luxury-gold' : 'bg-white/30 hover:bg-white/50'}`} />
                ))}
              </div>
            </>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent md:hidden" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0a0a0a] hidden md:block" />
        </div>

        {/* Right: Details */}
        <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto hide-scrollbar flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="text-luxury-gold/70 text-[10px] uppercase tracking-[0.3em] font-display mb-2 block">{item.category}</span>
              <h2 className="text-3xl md:text-4xl font-serif text-white leading-tight mb-2">{item.name}</h2>
            </div>
            <button onClick={() => setIsFavorite(!isFavorite)} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
              <Heart size={20} className={isFavorite ? "fill-red-500 text-red-500" : "text-white/50"} />
            </button>
          </div>
          <p className="text-white/60 font-light leading-relaxed mb-6">{item.description}</p>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
              <div className="text-white/40 text-[10px] uppercase tracking-widest mb-1 flex items-center gap-1.5"><Star size={12}/> Rating</div>
              <div className="text-white font-serif text-xl">{item.rating || '4.9'} <span className="text-sm text-luxury-gold">/ 5</span></div>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
              <div className="text-white/40 text-[10px] uppercase tracking-widest mb-1 flex items-center gap-1.5"><Clock size={12}/> Prep Time</div>
              <div className="text-white font-serif text-xl">{item.prepTime} <span className="text-sm text-white/50">min</span></div>
            </div>
            {item.calories > 0 && (
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                <div className="text-white/40 text-[10px] uppercase tracking-widest mb-1 flex items-center gap-1.5"><Flame size={12}/> Calories</div>
                <div className="text-white font-serif text-xl">{item.calories} <span className="text-sm text-white/50">kcal</span></div>
              </div>
            )}
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
              <div className="text-white/40 text-[10px] uppercase tracking-widest mb-1 flex items-center gap-1.5"><Leaf size={12}/> Dietary</div>
              <div className="text-white font-sans text-sm tracking-widest uppercase mt-1">{item.dietaryPreference}</div>
            </div>
          </div>
          <div className="space-y-6 mb-10 flex-1">
            {item.chefRecommendation && (
              <div className="border-l-2 border-luxury-gold pl-4 py-1">
                <h4 className="text-[10px] text-luxury-gold uppercase tracking-[0.2em] mb-1">Chef's Recommendation</h4>
                <p className="text-white/80 font-serif italic text-sm">"{item.chefRecommendation}"</p>
              </div>
            )}
            {item.preparationStyle && (
              <div>
                <h4 className="text-[10px] text-white/40 uppercase tracking-[0.2em] mb-2">Preparation Style</h4>
                <p className="text-white/70 text-sm font-light">{item.preparationStyle}</p>
              </div>
            )}
            {item.ingredients && item.ingredients.length > 0 && (
              <div>
                <h4 className="text-[10px] text-white/40 uppercase tracking-[0.2em] mb-3">Key Ingredients</h4>
                <div className="flex flex-wrap gap-2">
                  {item.ingredients.map((ing, i) => <span key={i} className="text-xs bg-white/5 text-white/70 px-3 py-1.5 rounded-full border border-white/10">{ing}</span>)}
                </div>
              </div>
            )}
          </div>
          <div className="mt-auto pt-6 border-t border-white/10 flex items-center justify-between gap-6">
            <div className="flex flex-col">
              <span className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Total</span>
              <span className="text-3xl font-display text-white">₹{(item.price * quantity).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-white/5 border border-white/10 rounded-full p-1">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:bg-white/10 transition-colors"><Minus size={16} /></button>
                <span className="w-8 text-center text-white font-bold">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:bg-white/10 transition-colors"><Plus size={16} /></button>
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { onAddToCart(item, quantity); onClose(); }} disabled={!item.isAvailable} className="bg-luxury-gold text-black px-8 py-4 rounded-full font-bold text-xs uppercase tracking-[0.2em] hover:bg-white hover:shadow-[0_0_30px_rgba(197,160,89,0.4)] transition-all flex items-center gap-2">
                <ShoppingBag size={16} /> Add to Cart
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- Add Button Component (Reusable) ---
const AddButton = ({ item, onAddToCart }) => {
  const [justAdded, setJustAdded] = useState(false);
  const handleAdd = (e) => {
    e.stopPropagation();
    if (!item.isAvailable || justAdded) return;
    onAddToCart(item, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleAdd}
      disabled={!item.isAvailable}
      className={`w-9 h-9 md:w-11 md:h-11 rounded-full border flex items-center justify-center transition-all flex-shrink-0 shadow-lg ${!item.isAvailable ? 'border-white/10 text-white/30 cursor-not-allowed' : justAdded ? 'bg-green-500 border-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'border-luxury-gold/50 text-luxury-gold hover:bg-luxury-gold hover:text-black hover:shadow-[0_0_15px_rgba(197,160,89,0.3)]'}`}
    >
      {justAdded ? <Star size={14} className="fill-white text-white" /> : <Plus size={16} strokeWidth={2.5} />}
    </motion.button>
  );
};

// --- Grid Menu Card ---
const MenuCard = ({ item, onClick, onAddToCart }) => {
  const primaryImage = item.images?.[0] || item.image || 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=800';
  const subtitle = item.description?.length > 30 ? item.description.substring(0, 30) + '...' : item.description;

  return (
    <motion.div 
      layout 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, scale: 0.95 }} 
      whileHover={{ y: -6 }} 
      onClick={() => onClick(item)} 
      className="group cursor-pointer flex flex-col gap-3 bg-white/[0.02] border border-white/5 rounded-[2rem] p-2.5 md:p-3 hover:border-luxury-gold/30 hover:bg-white/[0.04] transition-all duration-500 shadow-xl"
    >
      <div className="relative w-full aspect-square rounded-[1.6rem] overflow-hidden border border-white/5 group-hover:border-luxury-gold/20 transition-colors duration-500 shadow-lg">
        <CinematicImage src={primaryImage} alt={item.name} className="group-hover:scale-105 transition-transform duration-700 ease-out" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Status Badge aligned perfectly */}
        {item.badge && (
          <div className="absolute top-2 left-2 bg-luxury-gold text-black text-[7px] md:text-[8px] uppercase tracking-widest font-extrabold px-2 py-1 rounded-full shadow-md">
            {item.badge}
          </div>
        )}
        
        {/* Dietary tag on top right */}
        <div className="absolute top-2 right-2 flex gap-1">
          {item.dietaryPreference === 'Veg' && (
            <div className="w-4 h-4 rounded-full bg-black/60 backdrop-blur-md border border-green-500/40 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            </div>
          )}
          {item.dietaryPreference === 'Non-Veg' && (
            <div className="w-4 h-4 rounded-full bg-black/60 backdrop-blur-md border border-red-500/40 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between px-1.5 gap-2 min-w-0">
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-serif text-sm md:text-base leading-tight group-hover:text-luxury-gold transition-colors truncate">
            {item.name}
          </h4>
          <p className="text-white/40 text-[10px] font-light mt-0.5 truncate">
            {subtitle}
          </p>
          <span className="text-white/80 text-xs md:text-sm font-bold mt-1.5 block tracking-wider">
            ₹{item.price?.toLocaleString('en-IN')}
          </span>
        </div>
        <AddButton item={item} onAddToCart={onAddToCart} />
      </div>
    </motion.div>
  );
};

// --- List Menu Card ---
const ListMenuCard = ({ item, onClick, onAddToCart }) => {
  const primaryImage = item.images?.[0] || item.image || 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=800';
  const subtitle = item.description?.length > 55 ? item.description.substring(0, 55) + '...' : item.description;

  return (
    <motion.div 
      layout 
      initial={{ opacity: 0, x: -10 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: 10 }} 
      whileHover={{ scale: 1.01 }} 
      onClick={() => onClick(item)} 
      className="group cursor-pointer flex items-center gap-3.5 bg-white/[0.02] border border-white/5 hover:border-luxury-gold/30 hover:bg-white/[0.04] rounded-[2rem] p-2.5 md:p-4 transition-all duration-300 shadow-xl"
    >
      <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-[1.4rem] overflow-hidden flex-shrink-0 border border-white/5">
        <CinematicImage src={primaryImage} alt={item.name} className="group-hover:scale-105 transition-transform duration-700" />
        
        {/* Status Badge aligned perfectly */}
        {item.badge && (
          <div className="absolute top-1.5 left-1.5 bg-luxury-gold text-black text-[6px] md:text-[8px] uppercase tracking-widest font-extrabold px-1.5 py-0.5 rounded-full shadow-md">
            {item.badge}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 py-1">
        <div className="flex items-center gap-1.5 mb-1 min-w-0">
          {item.dietaryPreference === 'Veg' && (
            <div className="w-3.5 h-3.5 rounded-sm border border-green-500/50 flex items-center justify-center flex-shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            </div>
          )}
          {item.dietaryPreference === 'Non-Veg' && (
            <div className="w-3.5 h-3.5 rounded-sm border border-red-500/50 flex items-center justify-center flex-shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            </div>
          )}
          <h4 className="text-white font-serif text-sm md:text-xl truncate group-hover:text-luxury-gold transition-colors">
            {item.name}
          </h4>
        </div>
        <p className="text-white/40 text-[10px] md:text-xs font-light mb-1.5 truncate md:line-clamp-2 md:whitespace-normal">
          {subtitle}
        </p>
        <span className="text-white/80 text-xs md:text-base font-bold tracking-wider block">
          ₹{item.price?.toLocaleString('en-IN')}
        </span>
      </div>
      <div className="pr-1">
        <AddButton item={item} onAddToCart={onAddToCart} />
      </div>
    </motion.div>
  );
};

// --- Bottom Mobile Navigation ---
const BottomMobileNavigation = ({ onOpenCart, cartCount }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Home', icon: Home, path: '/' },
    { label: 'Menu', icon: UtensilsCrossed, path: '/menu' },
    { label: 'Book', icon: Clock, path: '/reservations' },
    { label: 'Cart', icon: ShoppingBag, action: onOpenCart, badge: cartCount },
    { label: 'Profile', icon: User, path: '#' }
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-sm h-16 bg-black/80 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-around px-4 z-[99] shadow-[0_15px_30px_rgba(0,0,0,0.8)] md:hidden">
      {navItems.map((item, idx) => {
        const Icon = item.icon;
        const isActive = item.path === '#' ? false : location.pathname === item.path;

        const handleClick = () => {
          if (item.action) {
            item.action();
          } else if (item.path !== '#') {
            navigate(item.path);
          } else {
            alert('Aura Premium Member Dashboard Coming Soon!');
          }
        };

        return (
          <button 
            key={idx} 
            onClick={handleClick} 
            className="flex flex-col items-center justify-center w-12 h-12 relative group"
          >
            <motion.div 
              whileTap={{ scale: 0.85 }} 
              className={`p-1.5 rounded-full transition-all duration-300 ${isActive ? 'text-luxury-gold' : 'text-white/40 group-hover:text-white'}`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            </motion.div>
            
            {/* Active Glow Dot */}
            {isActive && (
              <span className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-luxury-gold shadow-[0_0_10px_rgba(197,160,89,1)]" />
            )}

            {/* Cart Badge */}
            {item.badge !== undefined && item.badge > 0 && (
              <span className="absolute top-1 right-1 bg-luxury-gold text-black font-extrabold text-[8px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse-soft">
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

// --- Main SmartMenu Component ---
const SmartMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [orderMode, setOrderMode] = useState('Dine In'); // 'Dine In' | 'Takeaway'
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const scrollRef = useRef(null);

  const { cart, addToCart, setIsCartOpen } = useContext(CartContext);
  const { playSFX } = useContext(AudioContext);

  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Exact categories required by user
  const categoryFilters = ['All', 'Hot Coffee', 'Cold Brews', 'Matcha', 'Desserts', 'Pasta', 'Burgers', 'Bakery', 'Tea', 'Fresh Juice', 'Chef Specials'];

  const fetchMenu = async (retryCount = 0) => {
    setLoading(true);
    setFetchError(false);
    try {
      const res = await fetch('http://localhost:5001/api/menu');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.length === 0 && retryCount < 3) {
        // Empty result — backend may still be seeding, retry
        setTimeout(() => fetchMenu(retryCount + 1), 2000);
        return;
      }
      setMenuItems(data);
      setFetchError(false);
    } catch (error) {
      console.error('Error fetching menu:', error);
      if (retryCount < 3) {
        // Auto-retry up to 3 times (backend might be starting up)
        setTimeout(() => fetchMenu(retryCount + 1), 2000);
        return;
      }
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase()) && !item.description?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (activeCategory !== 'All' && item.category !== activeCategory) return false;
      if (isVegOnly && item.dietaryPreference === 'Non-Veg') return false;
      return true;
    });
  }, [menuItems, searchQuery, activeCategory, isVegOnly]);

  const handleAddToCart = (item, quantity = 1) => {
    try { playSFX('cart'); } catch (_) {}
    addToCart(item, quantity);
    setToastMsg(`${quantity}x ${item.name} added to cart`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <section className="min-h-screen bg-luxury-dark relative z-10 pt-24 pb-32 font-sans" id="menu">
      <div className="max-w-7xl mx-auto px-4 md:px-8">

        {/* --- Top Ordering Header --- */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white/5 border border-white/10 rounded-3xl p-2 mb-10 shadow-lg backdrop-blur-md">
          
          {/* Left: Order Mode Toggle */}
          <div className="flex bg-black/40 rounded-full p-1 w-full md:w-auto relative">
            <div 
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-luxury-gold transition-transform duration-300 ease-out z-0`} 
              style={{ transform: orderMode === 'Takeaway' ? 'translateX(100%)' : 'translateX(0)' }} 
            />
            <button 
              onClick={() => setOrderMode('Dine In')} 
              className={`flex-1 md:w-32 py-2 text-xs font-bold uppercase tracking-widest z-10 transition-colors duration-300 ${orderMode === 'Dine In' ? 'text-black' : 'text-white/60 hover:text-white'}`}
            >
              Dine In
            </button>
            <button 
              onClick={() => setOrderMode('Takeaway')} 
              className={`flex-1 md:w-32 py-2 text-xs font-bold uppercase tracking-widest z-10 transition-colors duration-300 ${orderMode === 'Takeaway' ? 'text-black' : 'text-white/60 hover:text-white'}`}
            >
              Takeaway
            </button>
          </div>

          {/* Center: Info */}
          <div className="hidden lg:flex items-center gap-8 text-white/60 text-sm font-light">
            <span className="flex items-center gap-2"><Phone size={14} className="text-luxury-gold"/> +91 98765 43210</span>
            <span className="flex items-center gap-2"><Clock size={14} className="text-luxury-gold"/> 08:00 AM - 11:00 PM</span>
            <button className="flex items-center gap-2 hover:text-luxury-gold transition-colors"><MapPin size={14} className="text-luxury-gold"/> Directions</button>
          </div>

          {/* Right: Cart Button */}
          <button 
            onClick={() => setIsCartOpen(true)}
            className="hidden md:flex items-center gap-3 bg-black/40 border border-white/10 px-6 py-2 rounded-full hover:border-luxury-gold/50 hover:bg-white/5 transition-all group"
          >
            <ShoppingBag size={18} className="text-luxury-gold" />
            <span className="text-xs uppercase tracking-widest text-white font-bold">Cart</span>
            {cartItemCount > 0 && (
              <span className="bg-luxury-gold text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse-soft">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>

        {/* --- Search & Filters Bar --- */}
        <div className="sticky top-20 z-30 bg-luxury-dark/95 backdrop-blur-2xl py-3 mb-6 -mx-4 px-4 md:mx-0 md:px-0 shadow-[0_10px_30px_rgba(0,0,0,0.6)] md:shadow-none border-b border-white/5 md:border-none">
          <div className="flex flex-col gap-4">
            
            {/* Search Input */}
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-luxury-gold/50 group-focus-within:text-luxury-gold transition-colors" size={20} />
              <input
                type="text"
                placeholder="Find a delicacy..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full py-3.5 pl-14 pr-6 text-base text-white placeholder-white/30 focus:outline-none focus:border-luxury-gold/50 focus:bg-white/10 transition-all duration-300 shadow-inner"
              />
            </div>

            {/* Responsive Top Controls Row (Always Visible on Mobile & Desktop) */}
            <div className="flex items-center justify-between gap-3 w-full bg-white/5 border border-white/10 p-2 rounded-full backdrop-blur-md">
              {/* LEFT: Full Menu Button */}
              <button 
                onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
                className={`px-3 md:px-5 py-2 rounded-full text-[9px] md:text-xs font-black uppercase tracking-widest transition-all duration-300 flex-shrink-0 ${activeCategory === 'All' ? 'bg-luxury-gold text-black shadow-[0_0_12px_rgba(197,160,89,0.3)]' : 'bg-black/40 border border-white/5 text-white/70 hover:text-white'}`}
              >
                Full Menu
              </button>

              {/* CENTER: Veg Only Toggle */}
              <button
                onClick={() => setIsVegOnly(!isVegOnly)}
                className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 rounded-full border transition-all duration-300 flex-shrink-0 ${isVegOnly ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-black/40 border-white/5 text-white/70'}`}
              >
                <Leaf size={11} className={isVegOnly ? "text-green-400 fill-green-400/20" : "text-white/40"} />
                <span className="text-[8px] md:text-xs font-black uppercase tracking-widest">Veg Only</span>
                <span className={`w-5 md:w-8 h-3 md:h-4 rounded-full relative transition-colors duration-300 flex items-center ${isVegOnly ? 'bg-green-600' : 'bg-white/20'}`}>
                  <span className={`absolute w-2 md:w-3 h-2 md:h-3 rounded-full bg-white transition-transform duration-300 ${isVegOnly ? 'translate-x-2.5 md:translate-x-4' : 'translate-x-0.5'}`} />
                </span>
              </button>

              {/* RIGHT: Grid/List View Icons */}
              <div className="flex bg-black/40 border border-white/5 p-1 rounded-full items-center flex-shrink-0">
                <button 
                  onClick={() => setViewMode('grid')} 
                  className={`p-1.5 rounded-full transition-colors ${viewMode === 'grid' ? 'bg-luxury-gold text-black' : 'text-white/40 hover:text-white'}`}
                >
                  <LayoutGrid size={13} />
                </button>
                <button 
                  onClick={() => setViewMode('list')} 
                  className={`p-1.5 rounded-full transition-colors ${viewMode === 'list' ? 'bg-luxury-gold text-black' : 'text-white/40 hover:text-white'}`}
                >
                  <List size={13} />
                </button>
              </div>
            </div>

            {/* Smooth Horizontally Scrolling Category Snap Slider */}
            <div className="relative group">
              <div 
                ref={scrollRef}
                className="overflow-x-auto hide-scrollbar flex gap-2 pb-1.5 -mb-1.5 snap-x snap-mandatory scroll-smooth"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {categoryFilters.map(category => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`snap-start flex-shrink-0 px-4 py-2.5 rounded-full text-[9px] md:text-xs uppercase tracking-[0.15em] transition-all duration-300 font-extrabold ${
                      activeCategory === category
                        ? 'bg-luxury-gold text-black border border-luxury-gold shadow-[0_0_15px_rgba(197,160,89,0.3)]'
                        : 'bg-black/40 border border-white/5 text-white/60 hover:bg-white/5 hover:border-white/20'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* --- Menu Rendering --- */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-12 h-12 border-4 border-luxury-gold border-t-transparent rounded-full animate-spin" />
            <p className="text-luxury-gold/70 text-sm tracking-widest uppercase animate-pulse">Curating Menu...</p>
          </div>
        ) : fetchError || (menuItems.length === 0 && !loading) ? (
          <div className="text-center py-32 bg-white/5 rounded-3xl border border-white/10">
            <UtensilsCrossed size={48} className="mx-auto text-white/20 mb-6" />
            <h4 className="text-2xl font-serif text-white mb-2">
              {fetchError ? 'Unable to reach the kitchen.' : 'Menu is being prepared.'}
            </h4>
            <p className="text-white/50 mb-8">
              {fetchError
                ? 'The server may be offline. Please ensure the backend is running.'
                : 'No items found. The menu may still be loading.'}
            </p>
            <button
              onClick={() => fetchMenu()}
              className="text-black bg-luxury-gold uppercase text-xs tracking-widest hover:bg-white transition-colors px-8 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(197,160,89,0.3)] hover:shadow-[0_0_30px_rgba(197,160,89,0.5)]"
            >
              Retry Connection
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-32 bg-white/5 rounded-3xl border border-white/10">
            <UtensilsCrossed size={48} className="mx-auto text-white/20 mb-6" />
            <h4 className="text-2xl font-serif text-white mb-2">No culinary matches found.</h4>
            <p className="text-white/50 mb-6">Try adjusting your filters or search terms.</p>
            <button onClick={() => { setSearchQuery(''); setActiveCategory('All'); setIsVegOnly(false); }} className="text-luxury-gold uppercase text-xs tracking-widest hover:text-white transition-colors border border-luxury-gold px-6 py-2 rounded-full">
              Reset Filters
            </button>
          </div>
        ) : (
          <motion.div layout className={viewMode === 'grid' ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10" : "flex flex-col gap-4 md:gap-6 max-w-4xl mx-auto"}>
            <AnimatePresence>
              {filteredItems.map((item) => (
                viewMode === 'grid' ? (
                  <MenuCard key={item._id} item={item} onClick={setSelectedItem} onAddToCart={handleAddToCart} />
                ) : (
                  <ListMenuCard key={item._id} item={item} onClick={setSelectedItem} onAddToCart={handleAddToCart} />
                )
              ))}
            </AnimatePresence>
          </motion.div>
        )}

      </div>

      {/* Modals & Toasts */}
      <AnimatePresence>
        {selectedItem && <ItemDetailsModal item={selectedItem} onClose={() => setSelectedItem(null)} onAddToCart={handleAddToCart} />}
      </AnimatePresence>
      <LuxuryToast message={toastMsg} visible={!!toastMsg} />
      <BottomMobileNavigation onOpenCart={() => setIsCartOpen(true)} cartCount={cartItemCount} />
    </section>
  );
};

export default SmartMenu;
