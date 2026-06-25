import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  CalendarCheck, 
  Coffee, 
  UtensilsCrossed, 
  Settings,
  LogOut,
  Users,
  LineChart,
  Sparkles
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const { logout, admin } = useContext(AuthContext);

  const navItems = [
    { name: 'Overview', path: '/', icon: <LayoutDashboard size={18} /> },
    { name: 'Live Orders', path: '/orders', icon: <ShoppingBag size={18} /> },
    { name: 'Reservations', path: '/reservations', icon: <CalendarCheck size={18} /> },
    { name: 'Kitchen Display', path: '/kitchen', icon: <UtensilsCrossed size={18} /> },
    { name: 'Menu Engine', path: '/menu', icon: <Coffee size={18} /> },
    { name: 'Analytics', path: '/analytics', icon: <LineChart size={18} /> },
    { name: 'AI Brain Training', path: '/ai-training', icon: <Sparkles size={18} /> },
    { name: 'Customers', path: '/customers', icon: <Users size={18} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={18} /> },
  ];

  return (
    <div className="w-64 h-screen fixed left-0 top-0 border-r border-white/5 bg-black/80 backdrop-blur-3xl flex flex-col z-40">
      
      {/* Brand Header */}
      <div className="p-8 border-b border-white/5">
        <h2 className="text-xl font-serif text-white tracking-widest">AURA <span className="text-luxury-gold">ADMIN</span></h2>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-8 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-light ${
                isActive 
                  ? 'bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/20 shadow-[0_0_15px_rgba(197,160,89,0.1)]' 
                  : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </div>

      {/* Footer User Area */}
      <div className="p-4 border-t border-white/5">
        <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-luxury-gold/20 flex items-center justify-center text-luxury-gold font-bold text-xs">
              {admin?.name?.charAt(0)}
            </div>
            <div>
              <p className="text-white text-xs font-bold">{admin?.name}</p>
              <p className="text-luxury-gold/60 text-[10px] uppercase tracking-wider">{admin?.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
