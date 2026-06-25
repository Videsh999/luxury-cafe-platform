import React, { useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Wallet, Smartphone, Banknote, ArrowLeft, CheckCircle2, Clock, ShieldCheck, Star, MapPin, Package, UtensilsCrossed, ChevronRight, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { AudioContext } from '../context/AudioContext';

const PAYMENT_METHODS = [
  { id: 'cod',  name: 'Cash on Delivery', icon: <Banknote size={20}/>,   desc: 'Pay at table or doorstep',   color: 'text-green-400' },
  { id: 'upi',  name: 'UPI',              icon: <Smartphone size={20}/>,  desc: 'GPay · PhonePe · Paytm',    color: 'text-blue-400' },
  { id: 'card', name: 'Card',             icon: <CreditCard size={20}/>,  desc: 'Visa · Mastercard · RuPay', color: 'text-purple-400' },
  { id: 'wallet',name: 'Wallet',          icon: <Wallet size={20}/>,      desc: 'Aura Wallet · Paytm',       color: 'text-amber-400' },
];

const ORDER_TYPES = [
  { id: 'Dine In',  icon: <UtensilsCrossed size={16}/>, label: 'Dine In' },
  { id: 'Takeaway', icon: <Package size={16}/>,         label: 'Takeaway' },
  { id: 'Delivery', icon: <MapPin size={16}/>,          label: 'Delivery' },
];

const InputField = ({ label, ...props }) => (
  <div>
    <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">{label}</label>
    <input {...props} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:border-luxury-gold focus:outline-none transition-colors text-sm" />
  </div>
);

export default function Checkout() {
  const { cart, totalAmount, clearCart } = useContext(CartContext);
  const { user }                         = useContext(AuthContext);
  const { playSFX }                      = useContext(AudioContext);
  const navigate                         = useNavigate();

  const [orderType,        setOrderType]        = useState('Dine In');
  const [tables,           setTables]           = useState([]);
  const [selectedTable,    setSelectedTable]     = useState(null);
  const [loadingTables,    setLoadingTables]     = useState(false);
  const [paymentMethod,    setPaymentMethod]     = useState(null);
  const [customerName,     setCustomerName]      = useState(user?.name || '');
  const [mobileNumber,     setMobileNumber]      = useState('');
  const [deliveryAddress,  setDeliveryAddress]   = useState('');
  const [guestCount,       setGuestCount]        = useState(1);
  const [isProcessing,     setIsProcessing]      = useState(false);
  const [error,            setError]             = useState('');
  const [orderData,        setOrderData]         = useState(null);
  const [step,             setStep]              = useState(1);

  // Fetch tables when Dine In selected
  useEffect(() => {
    if (orderType !== 'Dine In') { setSelectedTable(null); return; }
    setLoadingTables(true);
    fetch('http://localhost:5001/api/tables')
      .then(r => r.json())
      .then(data => {
        console.log("Fetched tables:", data);
        setTables(Array.isArray(data) ? data : []);
      })
      .catch(() => setTables([]))
      .finally(() => setLoadingTables(false));
  }, [orderType]);

  const validate = () => {
    if (!customerName.trim()) return 'Please enter your name.';
    if (!mobileNumber.trim()) return 'Please enter your mobile number.';
    if (!paymentMethod)       return 'Please select a payment method.';
    if (orderType === 'Dine In'  && !selectedTable) return 'Please select your table before placing the order.';
    if (orderType === 'Delivery' && !deliveryAddress.trim()) return 'Please enter your delivery address.';
    return null;
  };

  const handlePlaceOrder = async () => {
    // Detect and handle stale cart items (e.g., from before MongoDB was seeded)
    if (cart.some(i => !i._id || i._id.toString().length < 24 || i._id.toString().startsWith('m'))) {
      clearCart();
      setError('Your cart contained outdated menu items and has been reset. Please add your items again.');
      return;
    }

    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setIsProcessing(true);
    try { playSFX('click'); } catch (_) {}

    const endpoint = paymentMethod === 'cod'
      ? 'http://localhost:5001/api/orders/cod'
      : 'http://localhost:5001/api/orders';

    const payload = {
      items:           cart.map(i => ({ menuItem: i._id, quantity: i.quantity, price: i.price, prepTime: i.prepTime })),
      totalAmount,
      customerName,
      mobileNumber,
      guestCount,
      user:            user?._id || null,
      orderType,
      paymentMode:     paymentMethod.toUpperCase(),
      // Dine In fields
      tableNumber:     selectedTable ? `${selectedTable.type === 'VIP' ? 'VIP ' : ''}Table ${selectedTable.number}` : undefined,
      tableId:         selectedTable?._id,
      tableName:       selectedTable?.name,
      tableArea:       selectedTable?.area,
      tableType:       selectedTable?.type,
      // Delivery
      deliveryAddress: orderType === 'Delivery' ? deliveryAddress : undefined,
    };

    try {
      const res  = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (res.ok) {
        try { playSFX('success'); } catch (_) {}
        setOrderData(data);
        setStep(2);
        setTimeout(() => clearCart(), 600);
      } else {
        setError(data.message || 'Failed to place order. Please try again.');
      }
    } catch (_) {
      setError('Network error. Please check your connection.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0 && step === 1) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-center px-6">
      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
        <CreditCard className="text-white/20" size={36} />
      </div>
      <p className="font-luxury italic text-white text-2xl">Your basket is empty</p>
      <button onClick={() => navigate('/menu')} className="text-luxury-gold text-xs uppercase tracking-widest hover:text-white transition-colors">
        Return to Menu
      </button>
    </div>
  );

  return (
    <div className="min-h-screen pt-28 pb-24 px-4 md:px-8 max-w-6xl mx-auto">
      <AnimatePresence mode="wait">

        {/* ── Step 1: Checkout form ── */}
        {step === 1 && (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid lg:grid-cols-12 gap-10">

            {/* Left */}
            <div className="lg:col-span-8 space-y-10">
              {/* Header */}
              <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <ArrowLeft className="text-white/40" size={20} />
                </button>
                <div>
                  <p className="text-luxury-gold/70 tracking-[0.4em] uppercase text-[10px] font-sans">Your Order</p>
                  <h1 className="font-luxury italic text-3xl text-white">Checkout</h1>
                </div>
              </div>

              {/* Order type selector */}
              <div>
                <p className="text-white/40 text-[10px] uppercase tracking-widest mb-4">Order Type</p>
                <div className="grid grid-cols-3 gap-3">
                  {ORDER_TYPES.map(t => (
                    <button key={t.id} onClick={() => setOrderType(t.id)}
                      className={`flex items-center justify-center gap-2 py-3.5 rounded-xl border text-xs tracking-widest uppercase font-medium transition-all duration-300 ${
                        orderType === t.id ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-[0_0_20px_rgba(197,160,89,0.1)]' : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'}`}>
                      {t.icon}{t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Guest details */}
              <div className="space-y-5">
                <p className="text-white/40 text-[10px] uppercase tracking-widest">Guest Details</p>
                <div className="grid sm:grid-cols-2 gap-5">
                  <InputField label="Full Name"     type="text" value={customerName}   onChange={e => setCustomerName(e.target.value)}   placeholder="Your name" />
                  <InputField label="Mobile Number" type="tel"  value={mobileNumber}   onChange={e => setMobileNumber(e.target.value)}    placeholder="+91 00000 00000" />
                </div>
                <div>
                  <p className="text-white/40 text-[10px] uppercase tracking-widest mb-3">Guests</p>
                  <div className="flex gap-3">
                    {[1, 2, 3, 4, 6, 8].map(n => (
                      <button key={n} onClick={() => setGuestCount(n)}
                        className={`w-12 h-12 rounded-xl border text-sm transition-all duration-300 ${guestCount === n ? 'bg-luxury-gold text-black border-luxury-gold font-bold' : 'bg-white/5 border-white/10 text-white/50 hover:border-white/30'}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Dine In: Table selector ── */}
              <AnimatePresence>
                {orderType === 'Dine In' && (
                  <motion.div key="tables" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                    <div className="flex items-center justify-between">
                      <p className="text-white/40 text-[10px] uppercase tracking-widest">Select Your Table <span className="text-red-400">*</span></p>
                      {selectedTable && <span className="text-luxury-gold text-[10px] uppercase tracking-widest">✓ {selectedTable.name}</span>}
                    </div>

                    {loadingTables ? (
                      <div className="flex justify-center py-10">
                        <div className="w-8 h-8 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1 hide-scrollbar">
                        {tables.map(table => {
                          const available = table.status === 'Available';
                          const selected  = selectedTable?._id === table._id;
                          return (
                            <button key={table._id} disabled={!available}
                              onClick={() => setSelectedTable(available ? (selected ? null : table) : null)}
                              className={`relative p-4 rounded-xl border text-left transition-all duration-300 ${
                                selected    ? 'bg-luxury-gold/10 border-luxury-gold shadow-[0_0_20px_rgba(197,160,89,0.15)]'
                                : available ? 'bg-white/5 border-white/10 hover:border-white/25 cursor-pointer'
                                            : 'bg-white/[0.02] border-white/5 opacity-40 cursor-not-allowed'}`}>
                              {selected && <CheckCircle2 size={14} className="text-luxury-gold absolute top-3 right-3" />}
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`text-[9px] px-2 py-0.5 rounded-full uppercase tracking-widest font-bold ${
                                  table.status === 'Available' ? 'bg-emerald-500/20 text-emerald-400'
                                  : table.status === 'Reserved' ? 'bg-amber-500/20 text-amber-400'
                                  : 'bg-red-500/20 text-red-400'}`}>
                                  {table.status}
                                </span>
                                {table.type === 'VIP' && <span className="text-[9px] bg-luxury-gold/20 text-luxury-gold px-2 py-0.5 rounded-full uppercase tracking-widest">VIP</span>}
                              </div>
                              <p className="font-luxury italic text-white text-base leading-tight">{table.name}</p>
                              <p className="text-white/30 text-[10px] mt-1">{table.area}</p>
                              <p className="text-white/20 text-[10px]">Up to {table.capacity} guests</p>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ── Delivery: Address field ── */}
                {orderType === 'Delivery' && (
                  <motion.div key="delivery" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <p className="text-white/40 text-[10px] uppercase tracking-widest mb-3">Delivery Address <span className="text-red-400">*</span></p>
                    <textarea value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} rows={3}
                      placeholder="House/flat, street, landmark, city, pincode"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:border-luxury-gold focus:outline-none transition-colors text-sm resize-none" />
                  </motion.div>
                )}

                {/* ── Takeaway: info banner ── */}
                {orderType === 'Takeaway' && (
                  <motion.div key="takeaway" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="flex items-start gap-4 p-5 rounded-xl bg-white/5 border border-white/10">
                    <Package className="text-luxury-gold shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="text-white text-sm font-medium mb-1">Takeaway Order</p>
                      <p className="text-white/40 text-xs leading-relaxed">A unique pickup token will be generated after you place the order. Collect your order from the counter.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Payment methods */}
              <div className="space-y-4">
                <p className="text-white/40 text-[10px] uppercase tracking-widest">Payment Method</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {PAYMENT_METHODS.map(m => (
                    <motion.button key={m.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => setPaymentMethod(m.id)}
                      className={`flex items-center gap-4 p-5 rounded-xl border text-left transition-all duration-300 ${
                        paymentMethod === m.id ? 'bg-luxury-gold/10 border-luxury-gold shadow-[0_0_20px_rgba(197,160,89,0.1)]' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
                      <div className={`${m.color} ${paymentMethod === m.id ? 'opacity-100' : 'opacity-60'}`}>{m.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium">{m.name}</p>
                        <p className="text-white/30 text-xs">{m.desc}</p>
                      </div>
                      {paymentMethod === m.id && <CheckCircle2 size={16} className="text-luxury-gold shrink-0" />}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                    <AlertCircle size={18} className="text-red-400 shrink-0" />
                    <p className="text-red-300 text-sm">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Security note */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
                <p className="text-white/30 text-xs">All transactions are encrypted and processed securely.</p>
              </div>
            </div>

            {/* Right: Order summary */}
            <div className="lg:col-span-4">
              <div className="sticky top-28 space-y-5">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-7 backdrop-blur-xl">
                  <p className="text-white/40 text-[10px] uppercase tracking-widest mb-5">Order Summary</p>

                  {/* Items */}
                  <div className="space-y-3 mb-6">
                    {cart.map(item => (
                      <div key={item._id} className="flex justify-between items-center">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-white/25 text-xs shrink-0">{item.quantity}×</span>
                          <span className="text-white/70 text-sm truncate">{item.name}</span>
                        </div>
                        <span className="text-white/50 text-xs font-display shrink-0 ml-2">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>

                  {/* Order type badge */}
                  <div className="flex items-center gap-2 py-4 border-t border-white/10 mb-2">
                    <span className="text-white/30 text-[10px] uppercase tracking-widest">Order Type</span>
                    <span className="text-luxury-gold text-[10px] uppercase tracking-widest ml-auto">{orderType}</span>
                  </div>

                  {/* Table badge (Dine In only) */}
                  {orderType === 'Dine In' && (
                    <div className="flex items-center gap-2 pb-4 border-b border-white/10 mb-4">
                      <span className="text-white/30 text-[10px] uppercase tracking-widest">Table</span>
                      <span className={`text-[10px] uppercase tracking-widest ml-auto ${selectedTable ? 'text-luxury-gold' : 'text-red-400/70'}`}>
                        {selectedTable ? selectedTable.name : 'Not selected *'}
                      </span>
                    </div>
                  )}

                  {/* Totals */}
                  <div className="space-y-2.5 py-4 border-t border-white/10">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/30">Subtotal</span>
                      <span className="text-white/60 font-display">₹{totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/30">Tax</span>
                      <span className="text-white/60 font-display">₹0</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-5 border-t border-white/10 mb-6">
                    <span className="text-white/60 text-xs uppercase tracking-widest">Total</span>
                    <span className="font-luxury italic text-white text-3xl">₹{totalAmount.toLocaleString('en-IN')}</span>
                  </div>

                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    disabled={isProcessing}
                    onClick={handlePlaceOrder}
                    className={`w-full py-4 rounded-xl text-xs font-bold uppercase tracking-[0.25em] flex items-center justify-center gap-2 transition-all duration-500 ${
                      isProcessing ? 'bg-white/10 text-white/30 cursor-not-allowed' : 'bg-luxury-gold text-black hover:bg-white shadow-[0_8px_30px_rgba(197,160,89,0.3)]'}`}>
                    {isProcessing ? <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : <>Place Order <ChevronRight size={15} /></>}
                  </motion.button>
                </div>

                {/* Rewards preview */}
                <div className="bg-luxury-gold/5 border border-luxury-gold/15 rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-luxury-gold flex items-center justify-center shrink-0">
                    <Star size={16} className="text-black fill-black" />
                  </div>
                  <div>
                    <p className="text-luxury-gold text-[10px] uppercase tracking-widest font-bold">Aura Rewards</p>
                    <p className="text-white/40 text-[10px] mt-1">Earn {Math.floor(totalAmount)} points with this order</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Step 2: Confirmation ── */}
        {step === 2 && (
          <motion.div key="confirm" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center text-center py-20 min-h-[60vh]">

            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12, delay: 0.1 }}
              className="relative w-28 h-28 mb-12">
              <div className="w-28 h-28 bg-luxury-gold rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(197,160,89,0.4)]">
                <CheckCircle2 size={52} className="text-black" />
              </div>
              <motion.div initial={{ opacity: 0.4, scale: 1 }} animate={{ opacity: 0, scale: 1.8 }} transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 rounded-full border border-luxury-gold" />
            </motion.div>

            <p className="text-luxury-gold/70 tracking-[0.4em] uppercase text-[10px] font-sans mb-3">Confirmed</p>
            <h2 className="font-luxury italic text-4xl md:text-5xl text-white mb-10">Order Placed</h2>

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="w-full max-w-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-10">

              {/* Table / Token header */}
              <div className="bg-luxury-gold/10 border-b border-white/10 px-8 py-6 flex justify-between items-center">
                <div className="text-left">
                  <p className="text-luxury-gold/60 text-[9px] uppercase tracking-widest mb-1">
                    {orderData?.orderType === 'Dine In' ? 'Your Table' : orderData?.orderType === 'Takeaway' ? 'Pickup Token' : 'Order Type'}
                  </p>
                  <p className="font-luxury italic text-white text-2xl">
                    {orderData?.orderType === 'Dine In'
                      ? (orderData?.tableName || orderData?.tableNumber || 'Table Assigned')
                      : orderData?.orderType === 'Takeaway'
                        ? orderData?.pickupToken
                        : 'Delivery'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-luxury-gold/60 text-[9px] uppercase tracking-widest mb-1">Ref</p>
                  <p className="font-mono text-white text-xl">#{orderData?._id?.slice(-6).toUpperCase() || 'AURA01'}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 divide-x divide-white/10">
                {[
                  { icon: <Clock size={18}/>,       label: 'Ready In',     value: orderData?.waitTime || '15–20 Min' },
                  { icon: <Star size={18}/>,        label: 'Your Host',    value: orderData?.hostName || 'Sebastian' },
                  { icon: <ShieldCheck size={18}/>, label: 'Payment',      value: orderData?.paymentMode || 'COD' },
                ].map(col => (
                  <div key={col.label} className="p-5 text-center">
                    <div className="text-luxury-gold/50 flex justify-center mb-2">{col.icon}</div>
                    <p className="text-white/30 text-[9px] uppercase tracking-widest mb-1">{col.label}</p>
                    <p className="text-white text-sm font-display">{col.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => navigate(`/tracking/${orderData?._id}`, { state: { orderData } })}
                className="px-10 py-4 bg-luxury-gold text-black rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors duration-500">
                Track My Order
              </button>
              <button onClick={() => navigate('/')}
                className="px-10 py-4 border border-white/15 text-white rounded-xl text-xs uppercase tracking-widest hover:bg-white/5 transition-colors duration-500">
                Return Home
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
