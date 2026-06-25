import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  Clock, 
  Users, 
  MapPin, 
  CheckCircle2, 
  ChefHat, 
  Utensils, 
  Banknote, 
  XCircle,
  MoreVertical,
  Bell,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import { io } from 'socket.io-client';

const LiveOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Active'); // Active, Kitchen, COD, Completed
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchOrders();

    const socket = io('http://localhost:5001');
    socket.on('new_order', (newOrder) => {
      setOrders(prev => [newOrder, ...prev]);
      playNotificationSound();
    });

    socket.on('order_status_update', (updatedOrder) => {
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    });

    return () => socket.disconnect();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  const playNotificationSound = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(e => console.log("Audio play blocked"));
  };

  const updateOrderStatus = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:5001/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchOrders();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const updatePaymentStatus = async (id, paymentStatus) => {
    try {
      const res = await fetch(`http://localhost:5001/api/orders/${id}/payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus })
      });
      if (res.ok) fetchOrders();
    } catch (err) {
      console.error("Failed to update payment", err);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'New Order': return 'text-blue-400 bg-blue-500/5 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]';
      case 'Preparing': return 'text-orange-400 bg-orange-500/5 border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]';
      case 'Ready': return 'text-green-400 bg-green-500/5 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]';
      case 'Served': return 'text-purple-400 bg-purple-500/5 border-purple-500/20';
      case 'Completed': return 'text-white/20 bg-white/5 border-white/10';
      case 'Rejected': return 'text-red-400 bg-red-500/5 border-red-500/20';
      default: return 'text-white/40 bg-white/5 border-white/10';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order._id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          order.customerName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (activeTab === 'Active') return ['New Order', 'Preparing', 'Ready', 'Served'].includes(order.status);
    if (activeTab === 'Kitchen') return ['Preparing', 'Ready'].includes(order.status);
    if (activeTab === 'COD') return order.paymentMode === 'COD';
    if (activeTab === 'Completed') return order.status === 'Completed';
    return true;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-12 pb-20"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h2 className="text-4xl font-serif text-white tracking-tight">Order Velocity</h2>
          <div className="flex items-center gap-3 mt-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-luxury-gold opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-luxury-gold"></span>
            </span>
            <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-black">Live Pulse • Hospitality Feed</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-luxury-gold transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search by ID or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-black/40 border border-white/5 rounded-2xl pl-14 pr-8 py-4 text-sm text-white focus:outline-none focus:border-luxury-gold/50 focus:bg-black/60 w-80 transition-all duration-500 placeholder:text-white/10"
            />
          </div>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-4 bg-luxury-gold/10 text-luxury-gold rounded-2xl border border-luxury-gold/20 relative group"
          >
            <Bell size={20} />
            <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </motion.button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-black/40 rounded-3xl border border-white/5 p-1.5 backdrop-blur-3xl shadow-inner w-max">
        {['Active', 'Kitchen', 'COD', 'Completed'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-3 rounded-2xl text-[10px] uppercase tracking-[0.2em] font-black transition-all duration-500 ${
              activeTab === tab 
                ? 'bg-luxury-gold text-black shadow-lg shadow-luxury-gold/20' 
                : 'text-white/30 hover:text-white'
            }`}
          >
            {tab} <span className="ml-3 opacity-30">[{orders.filter(o => {
              if (tab === 'Active') return ['New Order', 'Preparing', 'Ready', 'Served'].includes(o.status);
              if (tab === 'Kitchen') return ['Preparing', 'Ready'].includes(o.status);
              if (tab === 'COD') return o.paymentMode === 'COD';
              if (tab === 'Completed') return o.status === 'Completed';
              return false;
            }).length}]</span>
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredOrders.map((order, idx) => (
            <motion.div
              key={order._id}
              layout
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
              transition={{ duration: 0.6, ease: [0.6, 0.05, 0.01, 0.9] }}
              className="glass-panel group relative overflow-hidden border-white/5 hover:border-luxury-gold/30 transition-all duration-700 h-full flex flex-col"
            >
              {/* Luxury Progress Bar */}
              {['New Order', 'Preparing', 'Ready'].includes(order.status) && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 z-20">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ 
                      width: order.status === 'New Order' ? '25%' : 
                             order.status === 'Preparing' ? '60%' : '100%' 
                    }}
                    className={`h-full transition-all duration-[2000ms] ${
                      order.status === 'New Order' ? 'bg-blue-500' : 
                      order.status === 'Preparing' ? 'bg-orange-500' : 'bg-green-500'
                    }`}
                  />
                </div>
              )}

              {/* Card Header */}
              <div className="p-8 border-b border-white/5 flex justify-between items-start relative z-10">
                 <div>
                    <div className="flex items-center gap-3 mb-2">
                       <span className="text-luxury-gold text-[9px] uppercase tracking-[0.3em] font-black">Ticket #{order._id.slice(-6).toUpperCase()}</span>
                       <span className="w-1 h-1 rounded-full bg-white/20"></span>
                       <span className="text-white/30 text-[9px] uppercase tracking-[0.2em] font-bold">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <h4 className="text-white font-serif text-2xl tracking-wide group-hover:text-luxury-gold transition-colors duration-500">{order.customerName || 'Private Guest'}</h4>
                 </div>
                 <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border transition-all duration-500 ${getStatusStyle(order.status)}`}>
                   {order.status}
                 </div>
              </div>

              {/* Card Body */}
              <div className="p-8 space-y-8 flex-1 flex flex-col relative z-10">
                 {/* Items List */}
                 <div className="space-y-4">
                    {order.items.map((item, i) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                        key={i} className="flex justify-between items-center"
                      >
                        <div className="flex items-center gap-4">
                           <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] text-luxury-gold font-black border border-white/5 shadow-inner">
                             {item.quantity}
                           </div>
                           <span className="text-white/80 text-sm font-light tracking-wide">{item.menuItem?.name || 'Asset Selection'}</span>
                        </div>
                        <span className="text-white/20 text-[10px] font-mono tracking-tighter">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                      </motion.div>
                    ))}
                 </div>

                 {/* Meta Attributes */}
                 <div className="grid grid-cols-2 gap-y-5 gap-x-6 py-6 border-t border-b border-white/5">
                    <div className="space-y-1">
                       <span className="text-[9px] uppercase tracking-widest text-white/20 font-black">Prep Time</span>
                       <p className="text-white text-xs font-bold">{order.estimatedPrepTime || 12} MIN</p>
                    </div>
                    <div className="space-y-1">
                       <span className="text-[9px] uppercase tracking-widest text-white/20 font-black">Guests</span>
                       <p className="text-white text-xs font-bold">{order.guestCount || 1}</p>
                    </div>
                    <div className="space-y-1">
                       <span className="text-[9px] uppercase tracking-widest text-white/20 font-black">Payment</span>
                       <p className={`text-xs font-bold ${order.paymentStatus === 'Paid' ? 'text-green-400' : 'text-orange-400'}`}>
                         {order.paymentMode} · {order.paymentStatus}
                       </p>
                    </div>
                    <div className="space-y-1">
                       <span className="text-[9px] uppercase tracking-widest text-white/20 font-black">Mobile</span>
                       <p className="text-white text-xs font-bold">{order.mobileNumber || '—'}</p>
                    </div>
                 </div>

                 {/* Total Value */}
                 <div className="flex justify-between items-end mt-auto pt-4">
                    <div>
                      <span className="text-white/20 text-[9px] uppercase tracking-[0.3em] font-black block mb-1">Settlement Value</span>
                      <span className="text-3xl font-display font-black text-white tracking-tighter italic">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 text-white/20">
                       <Banknote size={20} />
                    </div>
                 </div>

                 {/* Premium Tactical Actions */}
                 <div className="grid grid-cols-1 gap-4 pt-8">
                    {order.status === 'New Order' && (
                      <div className="grid grid-cols-2 gap-4">
                        <motion.button 
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={() => updateOrderStatus(order._id, 'Preparing')}
                          className="py-4 bg-luxury-gold text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-luxury-gold/10 hover:bg-white transition-all flex items-center justify-center gap-3"
                        >
                          <ChefHat size={16} /> Authorize
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.02, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'rgba(239, 68, 68, 1)' }} whileTap={{ scale: 0.98 }}
                          onClick={() => updateOrderStatus(order._id, 'Rejected')}
                          className="py-4 bg-white/5 text-white/20 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                        >
                          Decline
                        </motion.button>
                      </div>
                    )}
                    {order.status === 'Preparing' && (
                      <motion.button 
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => updateOrderStatus(order._id, 'Ready')}
                        className="py-4 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center gap-3"
                      >
                        <CheckCircle2 size={16} /> Mark as Ready
                      </motion.button>
                    )}
                    {order.status === 'Ready' && (
                      <motion.button 
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => updateOrderStatus(order._id, 'Served')}
                        className="py-4 bg-green-500 text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white transition-all flex items-center justify-center gap-3"
                      >
                        <Utensils size={16} /> Commence Service
                      </motion.button>
                    )}
                    {order.status === 'Served' && (
                      <motion.button 
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => updateOrderStatus(order._id, 'Completed')}
                        className="py-4 bg-white/5 text-white/40 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3"
                      >
                        <CheckCircle2 size={16} /> Close Session
                      </motion.button>
                    )}
                 </div>

                 {/* COD Tactical Overlay */}
                 {order.paymentMode === 'COD' && order.paymentStatus === 'COD Pending' && (
                   <motion.button 
                     initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                     onClick={() => updatePaymentStatus(order._id, 'Paid')}
                     className="w-full mt-4 py-3 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] hover:bg-blue-500 hover:text-white transition-all"
                   >
                     Validate COD Settlement
                   </motion.button>
                 )}
              </div>

              {/* Decorative Reflection */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/[0.02] to-white/0 pointer-events-none group-hover:via-white/5 transition-all duration-700" />
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredOrders.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="col-span-full py-48 text-center flex flex-col items-center"
          >
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-8 border border-white/5 shadow-inner">
              <ShoppingBag size={32} className="text-white/10" />
            </div>
            <p className="text-white/20 font-serif text-xl tracking-widest italic font-light">No active traffic detected in this frequency</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default LiveOrders;
