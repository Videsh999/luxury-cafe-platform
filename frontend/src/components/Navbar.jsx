import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingBag, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import AuthModal from './AuthModal';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [hoveredPath, setHoveredPath] = useState(null);
  
  const { user, logout } = useContext(AuthContext);
  const { cart, setIsCartOpen } = useContext(CartContext);
  const location = useLocation();
  
  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/#about' },
    { name: 'Menu', path: '/menu' },
    { name: 'Reservations', path: '/reservations' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Specialties', path: '/#specialties' },
    { name: 'Contact', path: '/#contact' },
  ];

  // Helper to handle hash scrolling
  const handleNavClick = (e, path) => {
    setIsOpen(false);
    if (path.startsWith('/#')) {
      const id = path.substring(2);
      // If we are not on the homepage, the Link component will handle navigation to /,
      // but we might need to wait for render then scroll. 
      // For simplicity, if we are already on '/', we can scroll immediately.
      if (location.pathname === '/') {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        } else if (id === 'contact') {
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }
      }
    }
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path.split('#')[0]) && path.split('#')[0] !== '/') return true;
    return false;
  };

  return (
    <>
      {/* 
        Floating Capsule Navbar wrapper 
        - Centers horizontally with left-1/2 -translate-x-1/2
        - Fixed to top
        - Uses lg breakpoint to collapse into mobile menu since there are many links
      */}
      <motion.div 
        initial={{ y: -100, opacity: 0, x: '-50%' }}
        animate={{ 
          y: isScrolled ? 16 : 24, 
          opacity: 1, 
          x: '-50%',
          scale: isScrolled ? 0.98 : 1
        }}
        transition={{ duration: 0.8, ease: [0.6, 0.05, 0.01, 0.9] }}
        className="fixed top-0 left-1/2 z-[100] w-[95%] sm:w-auto"
      >
        <nav 
          className={`
            relative flex items-center justify-between mx-auto transition-all duration-700
            rounded-[3rem] border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.5)]
            overflow-hidden
            ${isScrolled 
              ? 'bg-black/70 backdrop-blur-3xl px-6 py-3 border-white/20' 
              : 'bg-black/40 backdrop-blur-xl px-8 py-4'
            }
          `}
        >
          {/* Subtle animated gradient glow behind the navbar */}
          <div className="absolute inset-0 bg-gradient-to-r from-luxury-gold/5 via-transparent to-blue-500/5 pointer-events-none" />

          {/* Logo */}
          <Link to="/" className="relative z-10 flex items-center mr-8 lg:mr-12">
            <motion.div whileHover={{ scale: 1.05 }} className="group">
              <span className="text-2xl font-serif text-white tracking-[0.2em] font-bold">
                AURA<span className="text-luxury-gold italic">.</span>
              </span>
            </motion.div>
          </Link>

          {/* Desktop Links (Hidden on screens smaller than lg because of the number of links) */}
          <div 
            className="hidden lg:flex items-center space-x-1 relative z-10"
            onMouseLeave={() => setHoveredPath(null)}
          >
            {navLinks.map((link) => (
              <Link 
                key={link.path}
                to={link.path} 
                onClick={(e) => handleNavClick(e, link.path)}
                onMouseEnter={() => setHoveredPath(link.path)}
                className={`relative px-5 py-2.5 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold transition-colors duration-300 ${
                  isActive(link.path) || hoveredPath === link.path ? 'text-white' : 'text-white/50'
                }`}
              >
                <span className="relative z-10">{link.name}</span>
                
                {/* Active / Hover Background Pill */}
                {isActive(link.path) && !hoveredPath && (
                  <motion.div 
                    layoutId="navbar-active"
                    className="absolute inset-0 bg-white/10 border border-white/20 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                    transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                  />
                )}
                {hoveredPath === link.path && (
                  <motion.div 
                    layoutId="navbar-hover"
                    className="absolute inset-0 bg-luxury-gold/10 border border-luxury-gold/30 rounded-full shadow-[0_0_20px_rgba(197,160,89,0.15)]"
                    transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4 lg:space-x-6 ml-auto lg:ml-12 relative z-10">
            {/* Cart Button */}
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsCartOpen(true)} 
              className="relative p-2 text-white/80 hover:text-luxury-gold transition-colors duration-500 rounded-full hover:bg-white/5"
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              <AnimatePresence>
                {cartItemsCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute top-0 right-0 bg-luxury-gold text-black text-[8px] font-black h-3.5 w-3.5 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(197,160,89,0.5)] translate-x-1/4 -translate-y-1/4"
                  >
                    {cartItemsCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
            
            {/* User Button */}
            <div className="hidden lg:block h-6 w-px bg-white/10 mx-2" />
            
            {user ? (
              <div className="hidden lg:flex items-center gap-4 cursor-pointer group" onClick={logout}>
                <div className="flex flex-col items-end">
                  <span className="text-luxury-gold/70 text-[8px] uppercase tracking-widest font-black group-hover:text-luxury-gold transition-colors">Sign Out</span>
                  <span className="text-white text-[10px] font-medium tracking-wide">{user.name}</span>
                </div>
              </div>
            ) : (
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsAuthOpen(true)} 
                className="hidden lg:flex p-2 text-white/80 hover:text-luxury-gold transition-colors duration-500 rounded-full hover:bg-white/5"
              >
                <User size={18} strokeWidth={1.5} />
              </motion.button>
            )}

            {/* Mobile Hamburger */}
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-white hover:text-luxury-gold transition-colors rounded-full hover:bg-white/5"
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><X size={20} /></motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}><Menu size={20} /></motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </nav>
      </motion.div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(24px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.5 }}
            className="lg:hidden fixed inset-0 bg-luxury-dark/95 z-[90] flex flex-col items-center justify-center pt-20"
          >
            <div className="flex flex-col items-center space-y-8 w-full px-6">
              {navLinks.map((link, idx) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + idx * 0.05, type: "spring", stiffness: 100 }}
                  className="w-full text-center"
                >
                  <Link 
                    to={link.path} 
                    onClick={(e) => handleNavClick(e, link.path)} 
                    className="block text-3xl font-serif text-white hover:text-luxury-gold transition-colors tracking-widest w-full py-2"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="pt-8 w-full max-w-[200px]"
              >
                {user ? (
                  <button 
                    onClick={() => { logout(); setIsOpen(false); }} 
                    className="w-full py-4 border border-luxury-gold text-luxury-gold uppercase tracking-[0.3em] font-black text-xs rounded-[2rem] hover:bg-luxury-gold hover:text-black transition-all"
                  >
                    Sign Out
                  </button>
                ) : (
                  <button 
                    onClick={() => { setIsAuthOpen(true); setIsOpen(false); }} 
                    className="w-full py-4 bg-luxury-gold text-black uppercase tracking-[0.3em] font-black text-xs rounded-[2rem] shadow-[0_0_30px_rgba(197,160,89,0.3)] hover:bg-white transition-all"
                  >
                    Member Access
                  </button>
                )}
              </motion.div>
            </div>
            
            {/* Mobile Decorative Logo */}
            <div className="absolute bottom-10 opacity-5 pointer-events-none">
              <span className="text-8xl font-serif font-bold tracking-tighter">AURA</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};

export default Navbar;
