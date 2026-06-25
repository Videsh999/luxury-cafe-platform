import React, { useEffect, useState, useContext } from 'react';
import { useSearchParams, useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, ChefHat, Coffee, MapPin, Star, ShieldCheck } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { io } from 'socket.io-client';

const Tracking = () => {
  const [searchParams] = useSearchParams();
  const { id } = useParams();
  const location = useLocation();
  const orderId = id || searchParams.get('orderId');
  const { user } = useContext(AuthContext);
  
  const [order, setOrder] = useState(location.state?.orderData || null);
  const [status, setStatus] = useState('Pending');
  const [queuePosition, setQueuePosition] = useState(2);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Connect to Socket.io
    const socket = io('http://localhost:5001');

    socket.on('connect', () => {
      console.log('Connected to Tracking Socket');
    });

    // Listen for real-time updates for this order
    socket.on('order_status_update', (data) => {
      if (data._id === orderId) {
        setStatus(data.status);
      }
    });

    const fetchOrder = async () => {
      try {
        const res = await fetch(`http://localhost:5001/api/orders/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
          setStatus(data.status);
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId && !order) {
      fetchOrder();
    } else {
      setLoading(false);
    }

    return () => socket.disconnect();
  }, [orderId]);

  const getStatusIndex = (currentStatus) => {
    const statuses = ['New Order', 'Preparing', 'Ready', 'Served', 'Completed'];
    return statuses.indexOf(currentStatus);
  };

  const steps = [
    { icon: <Clock />, label: "Received" },
    { icon: <ChefHat />, label: "Kitchen" },
    { icon: <Coffee />, label: "Ready" },
    { icon: <MapPin />, label: "Serving" },
    { icon: <CheckCircle2 />, label: "Closed" }
  ];

  if (!user && !orderId) {
    return (
      <div className="pt-32 min-h-screen flex items-center justify-center bg-luxury-dark">
        <p className="text-white/50 text-xl font-light">Please log in to view your tracking history.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="pt-32 min-h-screen flex items-center justify-center bg-luxury-dark">
        <div className="w-16 h-16 border-4 border-luxury-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="pt-32 min-h-screen flex items-center justify-center bg-luxury-dark">
        <p className="text-white/50 text-xl font-light">Order not found.</p>
      </div>
    );
  }

  const currentIndex = getStatusIndex(status);

  return (
    <div className="pt-32 pb-20 min-h-screen bg-luxury-dark relative z-10">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-luxury-gold tracking-[0.2em] uppercase text-sm mb-4">Live Tracking</h2>
          <h3 className="text-3xl md:text-5xl font-serif text-white">Order #{order._id.slice(-6).toUpperCase()}</h3>
        </div>

        {/* Status Tracker */}
        <div className="glass-panel p-8 md:p-12 mb-12">
          <div className="relative">
            {/* Progress Bar Background */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2 hidden md:block"></div>
            
            {/* Active Progress Bar */}
            <motion.div 
              className="absolute top-1/2 left-0 h-1 bg-luxury-gold -translate-y-1/2 hidden md:block"
              initial={{ width: '0%' }}
              animate={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            ></motion.div>

            <div className="flex flex-col md:flex-row justify-between relative z-10 gap-8 md:gap-0">
              {steps.map((step, idx) => {
                const isActive = idx <= currentIndex;
                const isCurrent = idx === currentIndex;
                
                return (
                  <div key={idx} className="flex flex-row md:flex-col items-center gap-4 md:gap-2">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                      isActive ? 'bg-luxury-gold text-black shadow-[0_0_20px_rgba(197,160,89,0.4)]' : 'bg-black text-white/30 border border-white/10'
                    } ${isCurrent ? 'scale-110 ring-4 ring-luxury-gold/20' : ''}`}>
                      {isActive && !isCurrent ? <CheckCircle2 size={24} /> : step.icon}
                    </div>
                    <span className={`text-sm uppercase tracking-widest font-medium ${isActive ? 'text-white' : 'text-white/30'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Service Assignment */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-8 flex flex-col justify-center bg-luxury-gold/5 border-luxury-gold/20"
          >
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
               <div className="text-left">
                  <p className="text-luxury-gold text-[10px] uppercase tracking-widest mb-1">Service Area</p>
                  <p className="text-white text-xl font-serif">{order.serviceArea || 'Main Lounge'}</p>
               </div>
               <div className="text-right">
                  <p className="text-luxury-gold text-[10px] uppercase tracking-widest mb-1">Service Point</p>
                  <p className="text-white text-xl font-serif">{order.tableNumber || 'Table 01'}</p>
               </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <p className="text-white/40 text-[9px] uppercase tracking-widest mb-1 flex items-center gap-1"><Star size={10} className="text-luxury-gold"/> Host</p>
                  <p className="text-white text-lg font-display">{order.hostName || 'Sebastian'}</p>
               </div>
               <div className="text-right">
                  <p className="text-white/40 text-[9px] uppercase tracking-widest mb-1 flex items-center gap-1 justify-end"><ShieldCheck size={10} className="text-luxury-gold"/> Status</p>
                  <p className="text-luxury-gold text-lg font-display tracking-widest uppercase text-[10px]">Verified</p>
               </div>
            </div>
          </motion.div>

          {/* Estimated Time */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-8 text-center flex flex-col items-center justify-center"
          >
            <Clock size={40} className="text-luxury-gold mb-4 opacity-80" />
            <h4 className="text-white/60 uppercase tracking-widest text-xs mb-2">Estimated Prep Time</h4>
            <div className="text-5xl font-display text-white mb-2">{order.estimatedPrepTime} <span className="text-2xl text-white/50">min</span></div>
          </motion.div>

          {/* Order Details */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel p-8"
          >
            <h4 className="text-white font-serif text-xl mb-6 border-b border-white/10 pb-4">Order Summary</h4>
            <div className="space-y-4 mb-6">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <div className="flex gap-2 text-white/80">
                    <span className="text-luxury-gold">{item.quantity}x</span>
                    {item.menuItem.name || item.menuItem}
                  </div>
                  <span className="text-white">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center border-t border-white/10 pt-4">
              <span className="text-white/60 uppercase tracking-widest text-xs">Total Amount</span>
              <span className="text-2xl font-display text-luxury-gold">₹{order.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Tracking;
