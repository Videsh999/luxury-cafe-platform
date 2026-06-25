import React, { useState, useEffect, useContext, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  ShieldCheck,
  Map,
  Plus,
  Minus,
  CalendarDays,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { AudioContext } from '../context/AudioContext';
import { io } from 'socket.io-client';

const Reservations = () => {
  const { user } = useContext(AuthContext);
  const { playSFX } = useContext(AudioContext);

  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Data
  const [tables, setTables] = useState([]);
  const [bookedTableIds, setBookedTableIds] = useState([]);
  const [confirmationData, setConfirmationData] = useState(null);

  // Form State
  const nowForStr = new Date();
  const todayStr = `${nowForStr.getFullYear()}-${String(nowForStr.getMonth() + 1).padStart(2, '0')}-${String(nowForStr.getDate()).padStart(2, '0')}`;
  
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedTime, setSelectedTime] = useState('');
  const [guestCount, setGuestCount] = useState(2);
  const [duration, setDuration] = useState(90);

  const [selectedTables, setSelectedTables] = useState([]); 
  
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  // ── Calendar Logic ────────────────────────────────────────────────────────
  const [calendarMonth, setCalendarMonth] = useState(new Date(nowForStr.getFullYear(), nowForStr.getMonth(), 1));

  const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay();

  const handlePrevMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));
  };

  const isDatePast = (y, m, d) => {
    const checkDate = new Date(y, m, d);
    const today = new Date(nowForStr.getFullYear(), nowForStr.getMonth(), nowForStr.getDate());
    return checkDate < today;
  };

  // ── Time Slots & Grouping ───────────────────────────────────────────────────
  const TIME_CATEGORIES = [
    { name: 'Morning', start: 8, end: 11 },
    { name: 'Afternoon', start: 12, end: 16 },
    { name: 'Evening', start: 17, end: 22 }
  ];

  const generateTimeSlots = () => {
    const categories = { 'Morning': [], 'Afternoon': [], 'Evening': [] };
    const now = new Date();
    
    // Create Date objects in local time by parsing YYYY-MM-DD
    const [y, m, d] = selectedDate.split('-');
    const targetDate = new Date(y, m - 1, d);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // If selected date is strictly in the past, return empty
    if (targetDate < today) return categories;

    const isToday = targetDate.getTime() === today.getTime();

    TIME_CATEGORIES.forEach(cat => {
      for (let h = cat.start; h <= cat.end; h++) {
        ['00', '30'].forEach(minuteStr => {
          if (isToday) {
            const slotTime = new Date();
            slotTime.setHours(h, parseInt(minuteStr), 0, 0);
            if (slotTime <= new Date(now.getTime() + 30 * 60000)) return; // Needs 30 mins lead time
          }
          categories[cat.name].push(`${h.toString().padStart(2, '0')}:${minuteStr}`);
        });
      }
    });
    return categories;
  };

  const timeCategories = useMemo(() => generateTimeSlots(), [selectedDate, todayStr]);

  useEffect(() => {
    let isValid = false;
    for (const cat in timeCategories) {
      if (timeCategories[cat].includes(selectedTime)) isValid = true;
    }
    if (!isValid) setSelectedTime('');
  }, [timeCategories, selectedTime]);

  // ── Fetching Data ───────────────────────────────────────────────────────────
  useEffect(() => {
    fetchTables();
    const socket = io('http://localhost:5001');
    socket.on('reservation_update', () => {
      if (selectedDate && selectedTime) fetchBookedTables(selectedDate, selectedTime);
    });
    socket.on('table_update', fetchTables);
    return () => socket.disconnect();
  }, []);

  const fetchTables = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/tables');
      const data = await res.json();
      setTables(data);
    } catch (err) {
      console.error("Failed to fetch tables", err);
    }
  };

  const fetchBookedTables = async (date, time) => {
    try {
      const res = await fetch(`http://localhost:5001/api/reservations/booked-tables?date=${date}&timeSlot=${time}&duration=${duration}`);
      const data = await res.json();
      setBookedTableIds(data || []);
    } catch (err) {
      console.error("Failed to fetch booked tables", err);
    }
  };

  // No auto-selection: users must manually choose their preferred table(s).

  // ── Step Navigation ─────────────────────────────────────────────────────────
  const proceedToTime = () => {
    if (!selectedDate) { setError('Please select a date.'); return; }
    setError(''); setStep(2); playSFX('click');
  };

  const proceedToGuests = () => {
    if (!selectedTime) { setError('Please select a time slot.'); return; }
    setError(''); setStep(3); playSFX('click');
  };

  const proceedToTables = async () => {
    setError('');
    setLoading(true);
    await fetchBookedTables(selectedDate, selectedTime);
    setLoading(false);
    setSelectedTables([]); // Reset on new search
    setStep(4);
    playSFX('click');
  };

  const proceedToDetails = () => {
    if (selectedTables.length === 0) {
      setError(`Please select at least one table.`);
      return;
    }
    setError(''); setStep(5); playSFX('click');
  };

  const handleBook = async () => {
    if (!customerName.trim() || !email.trim() || !phone.trim()) {
      setError('Please provide all required guest details.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5001/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName, email, phone, tableIds: selectedTables.map(t => t._id),
          date: selectedDate, timeSlot: selectedTime, duration,
          partySize: guestCount, specialRequests, user: user?._id
        })
      });
      const data = await res.json();
      if (res.ok) {
        setConfirmationData(data);
        setStep(6);
        playSFX('success');
      } else {
        setError(data.message || 'Reservation failed. Tables may have just been booked.');
      }
    } catch (err) {
      setError('Server connection failed.');
    } finally {
      setLoading(false);
    }
  };

  // ── Render Helpers ──────────────────────────────────────────────────────────
  const toggleTableSelection = (table) => {
    if (bookedTableIds.includes(table._id)) return;
    
    setSelectedTables(prev => {
      const isSelected = prev.some(t => t._id === table._id);
      if (isSelected) {
        return prev.filter(t => t._id !== table._id);
      } else {
        return [...prev, table];
      }
    });
    playSFX('click');
  };

  const getTableStyle = (table) => {
    const isBooked = bookedTableIds.includes(table._id);
    const isSelected = selectedTables.some(t => t._id === table._id);

    if (isSelected) return 'bg-luxury-gold border-luxury-gold shadow-[0_0_50px_rgba(197,160,89,0.5)] z-40 text-black';
    if (isBooked) return 'bg-white/5 border-white/10 text-white/30 opacity-40 cursor-not-allowed';
    
    // Available
    return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer';
  };

  const stepVariants = {
    hidden: { opacity: 0, scale: 0.95, filter: 'blur(10px)' },
    visible: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 0.5, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 1.05, filter: 'blur(10px)', transition: { duration: 0.3 } }
  };

  const totalSelectedCapacity = selectedTables.reduce((sum, t) => sum + t.capacity, 0);

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 md:px-6 max-w-7xl mx-auto relative overflow-hidden font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-luxury-gold/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Progress Indicator */}
      {step < 6 && (
        <div className="max-w-4xl mx-auto mb-12 flex justify-center items-center gap-2 md:gap-4 text-[9px] md:text-[10px] uppercase tracking-widest font-bold">
           {[
             { num: 1, label: 'Date' },
             { num: 2, label: 'Time' },
             { num: 3, label: 'Guests' },
             { num: 4, label: 'Tables' },
             { num: 5, label: 'Confirm' }
           ].map(s => (
             <React.Fragment key={s.num}>
               <div className="flex flex-col items-center gap-2">
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${step >= s.num ? 'bg-luxury-gold text-black shadow-[0_0_15px_rgba(197,160,89,0.5)] scale-110' : 'bg-white/5 text-white/40 border border-white/10'}`}>
                   {step > s.num ? <CheckCircle2 size={14} /> : s.num}
                 </div>
                 <span className={`hidden md:block transition-colors duration-500 ${step >= s.num ? 'text-luxury-gold' : 'text-white/30'}`}>{s.label}</span>
               </div>
               {s.num < 5 && <div className={`h-[1px] w-6 md:w-16 transition-colors duration-500 ${step > s.num ? 'bg-luxury-gold' : 'bg-white/10'}`} />}
             </React.Fragment>
           ))}
        </div>
      )}

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center gap-3 text-red-400 text-sm backdrop-blur-md">
          <AlertCircle size={18} /> {error}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        
        {/* ── STEP 1: DATE SELECTION ── */}
        {step === 1 && (
          <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="max-w-md mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-serif text-white mb-2">Select Date</h2>
              <p className="text-luxury-gold uppercase tracking-[0.3em] text-[10px] font-bold">When will you join us?</p>
            </div>
            
            <div className="glass-panel p-8">
              {/* Calendar Header */}
              <div className="flex justify-between items-center mb-6">
                <button onClick={handlePrevMonth} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all"><ChevronLeft size={18}/></button>
                <div className="text-lg font-serif tracking-wide text-white">
                  {calendarMonth.toLocaleString('default', { month: 'long' })} <span className="text-luxury-gold">{calendarMonth.getFullYear()}</span>
                </div>
                <button onClick={handleNextMonth} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all"><ChevronRight size={18}/></button>
              </div>
              
              {/* Days of Week */}
              <div className="grid grid-cols-7 gap-2 mb-4 text-center">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} className="text-[10px] uppercase tracking-widest font-bold text-white/30">{day}</div>
                ))}
              </div>
              
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-10" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const isPast = isDatePast(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
                  const isSelected = selectedDate === dateStr;
                  const isCurrentDay = dateStr === todayStr;

                  return (
                    <button
                      key={day}
                      disabled={isPast}
                      onClick={() => { setSelectedDate(dateStr); playSFX('click'); }}
                      className={`h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 relative
                        ${isPast ? 'opacity-20 cursor-not-allowed text-white' : 
                          isSelected ? 'bg-luxury-gold text-black shadow-[0_0_20px_rgba(197,160,89,0.4)]' : 
                          'hover:bg-white/10 text-white'}
                      `}
                    >
                      {isCurrentDay && !isSelected && <div className="absolute bottom-1 w-1 h-1 rounded-full bg-luxury-gold" />}
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <button onClick={proceedToTime} className="w-full mt-8 bg-white text-black py-4 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-luxury-gold hover:shadow-[0_0_30px_rgba(197,160,89,0.4)] transition-all flex justify-center items-center gap-2">
              Select Time <ChevronRight size={16} />
            </button>
          </motion.div>
        )}

        {/* ── STEP 2: TIME SELECTION ── */}
        {step === 2 && (
          <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-serif text-white mb-2">Select Time</h2>
              <p className="text-luxury-gold uppercase tracking-[0.3em] text-[10px] font-bold">For {new Date(selectedDate.split('-')[0], selectedDate.split('-')[1]-1, selectedDate.split('-')[2]).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric'})}</p>
            </div>

            <div className="glass-panel p-8 md:p-12 space-y-10">
              {Object.entries(timeCategories).map(([category, slots]) => (
                <div key={category}>
                  {slots.length > 0 && (
                    <div className="flex items-center gap-4 mb-6">
                      <h4 className="text-white text-sm uppercase tracking-[0.2em] font-bold">{category}</h4>
                      <div className="flex-1 h-[1px] bg-gradient-to-r from-white/10 to-transparent" />
                    </div>
                  )}
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
                    {slots.map(slot => (
                      <button
                        key={slot}
                        onClick={() => { setSelectedTime(slot); playSFX('click'); }}
                        className={`py-3 md:py-4 rounded-2xl border text-sm md:text-base font-medium transition-all duration-300 ${
                          selectedTime === slot 
                            ? 'bg-luxury-gold text-black border-luxury-gold shadow-[0_0_20px_rgba(197,160,89,0.4)] scale-105' 
                            : 'bg-black/40 border-white/5 text-white/70 hover:border-white/20 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {Object.values(timeCategories).every(arr => arr.length === 0) && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10">
                    <Clock className="text-white/30" size={24} />
                  </div>
                  <p className="text-white/50 text-sm">No availability remaining for this date.</p>
                </div>
              )}
            </div>

            <div className="flex gap-4 mt-8">
              <button onClick={() => { setStep(1); playSFX('click'); }} className="px-8 py-4 rounded-2xl border border-white/10 text-white/70 hover:bg-white/5 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">Back</button>
              <button onClick={proceedToGuests} disabled={!selectedTime} className="flex-1 bg-white text-black py-4 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-luxury-gold transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                Set Guest Count <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: GUEST SELECTION ── */}
        {step === 3 && (
          <motion.div key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="max-w-md mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-serif text-white mb-2">Party Size</h2>
              <p className="text-luxury-gold uppercase tracking-[0.3em] text-[10px] font-bold">Intelligent table allocation up to 12 guests</p>
            </div>

            <div className="glass-panel p-12 text-center flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-luxury-gold/10 border border-luxury-gold/30 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(197,160,89,0.15)]">
                <Users size={32} className="text-luxury-gold" />
              </div>
              
              <div className="flex items-center justify-center gap-8 mb-8">
                <button onClick={() => { setGuestCount(Math.max(1, guestCount - 1)); playSFX('click'); }} className="w-14 h-14 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all group">
                  <Minus size={20} className="group-hover:scale-125 transition-transform" />
                </button>
                <div className="w-20 text-center">
                  <span className="text-6xl font-serif text-white tracking-tighter">{guestCount}</span>
                </div>
                <button onClick={() => { setGuestCount(Math.min(12, guestCount + 1)); playSFX('click'); }} className="w-14 h-14 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white hover:bg-luxury-gold hover:text-black hover:border-luxury-gold transition-all group shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                  <Plus size={20} className="group-hover:scale-125 transition-transform" />
                </button>
              </div>
              
              <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] max-w-xs mx-auto leading-loose">
                {guestCount > 8 ? "Large party detected. Our system will intelligently combine multiple tables to accommodate your group." : "Select the total number of guests joining."}
              </p>
            </div>

            <div className="flex gap-4 mt-8">
              <button onClick={() => { setStep(2); playSFX('click'); }} className="px-8 py-4 rounded-2xl border border-white/10 text-white/70 hover:bg-white/5 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">Back</button>
              <button onClick={proceedToTables} className="flex-1 bg-white text-black py-4 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-luxury-gold transition-all flex justify-center items-center gap-2">
                Find Tables <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 4: TABLE ALLOCATION ── */}
        {step === 4 && (
          <motion.div key="step4" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="max-w-5xl mx-auto space-y-8">
            <div className="text-center mb-6">
               <h2 className="text-4xl font-serif text-white mb-2">Floor Intelligence</h2>
               <p className="text-luxury-gold uppercase tracking-[0.3em] text-[10px] font-bold">
                 {loading ? 'Analyzing live availability...' : `Select tables for ${guestCount} guests`}
               </p>
            </div>

            {loading ? (
              <div className="h-[400px] glass-panel flex flex-col items-center justify-center">
                <Loader2 size={40} className="text-luxury-gold animate-spin mb-4" />
                <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-bold animate-pulse">Syncing Floor Plan</p>
              </div>
            ) : (
              <div className="relative bg-black/40 border border-white/10 rounded-[40px] p-8 md:p-16 backdrop-blur-3xl min-h-[500px]">
                 {/* Grid overlay */}
                 <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#c5a059 1.5px, transparent 1.5px)', backgroundSize: '60px 60px' }} />
                 
                 <div className="relative w-full grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 place-items-center">
                    {tables.map(table => {
                      const isBooked = bookedTableIds.includes(table._id);
                      const isSelected = selectedTables.some(t => t._id === table._id);
                      const style = getTableStyle(table);

                      return (
                        <motion.div
                          key={table._id}
                          whileHover={!isBooked ? { scale: 1.05, zIndex: 50 } : {}}
                          whileTap={!isBooked ? { scale: 0.95 } : {}}
                          onClick={() => toggleTableSelection(table)}
                          className={`relative w-28 h-28 md:w-32 md:h-32 rounded-[1.5rem] border-2 transition-all duration-500 flex flex-col items-center justify-center group ${style}`}
                        >
                           {isSelected && (
                             <motion.div layoutId="tableGlow" className="absolute inset-0 rounded-[1.5rem] bg-luxury-gold/30 blur-xl z-[-1]" />
                           )}
                           <div className="text-3xl font-serif mb-1">{table.number}</div>
                           <div className={`text-[10px] uppercase tracking-[0.1em] font-black ${isSelected ? 'text-black/70' : 'opacity-60'}`}>{table.capacity} Seats</div>
                           <div className={`text-[8px] uppercase tracking-widest mt-1 font-bold ${isSelected ? 'text-black/60' : 'opacity-40'}`}>
                             {isSelected ? 'Selected' : isBooked ? 'Reserved' : table.area}
                           </div>
                        </motion.div>
                      );
                    })}
                 </div>

                 {/* Selection Status Bar */}
                 <div className="absolute bottom-8 left-1/2 -translate-x-1/2 glass-panel rounded-full px-8 py-4 flex items-center gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                   <div className="flex flex-col items-center">
                     <span className="text-[9px] uppercase tracking-widest text-white/40 mb-1">Required</span>
                     <span className="text-white font-serif">{guestCount} Seats</span>
                   </div>
                   <div className="w-[1px] h-6 bg-white/10" />
                   <div className="flex flex-col items-center">
                     <span className="text-[9px] uppercase tracking-widest text-white/40 mb-1">Selected</span>
                     <span className={`font-serif ${totalSelectedCapacity >= guestCount ? 'text-green-400' : 'text-luxury-gold'}`}>{totalSelectedCapacity} Seats</span>
                   </div>
                 </div>
              </div>
            )}

            <div className="max-w-xl mx-auto flex gap-4 mt-8">
              <button onClick={() => { setStep(3); playSFX('click'); }} className="px-8 py-4 rounded-2xl border border-white/10 text-white/70 hover:bg-white/5 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">Back</button>
              <button onClick={proceedToDetails} disabled={selectedTables.length === 0} className="flex-1 bg-white text-black py-4 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-luxury-gold transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                Proceed to Details <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 5: DETAILS & CONFIRM ── */}
        {step === 5 && (
          <motion.div key="step5" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-serif text-white mb-2">Guest Identity</h2>
              <p className="text-luxury-gold uppercase tracking-[0.3em] text-[10px] font-bold mb-10">Finalize your reservation</p>
            </div>

            <div className="grid md:grid-cols-5 gap-8">
              {/* Form */}
              <div className="md:col-span-3 glass-panel p-8 md:p-10 space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-3 block">Full Name</label>
                    <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-white focus:outline-none focus:border-luxury-gold/50 transition-colors placeholder:text-white/20"
                      placeholder="E.g., James Bond" />
                  </div>
                  <div>
                    <label className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-3 block">Phone Number</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-white focus:outline-none focus:border-luxury-gold/50 transition-colors placeholder:text-white/20"
                      placeholder="+1 (555) 000-0000" />
                  </div>
                </div>

                <div>
                  <label className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-3 block">Email Address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-white focus:outline-none focus:border-luxury-gold/50 transition-colors placeholder:text-white/20"
                    placeholder="james@example.com" />
                </div>

                <div>
                  <label className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-3 block">Special Requests (Optional)</label>
                  <textarea rows={3} value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-white focus:outline-none focus:border-luxury-gold/50 transition-colors placeholder:text-white/20 custom-scrollbar resize-none"
                    placeholder="Allergies, anniversaries, dietary needs..." />
                </div>
              </div>

              {/* Summary Sidebar */}
              <div className="md:col-span-2">
                <div className="bg-gradient-to-b from-luxury-gold/10 to-transparent border border-luxury-gold/20 rounded-[2rem] p-8 relative overflow-hidden h-full flex flex-col">
                  <ShieldCheck size={120} className="absolute -top-10 -right-10 text-luxury-gold/10" />
                  
                  <h3 className="text-white font-serif text-2xl mb-8">Summary</h3>
                  
                  <div className="space-y-6 flex-1 relative z-10">
                    <div className="flex justify-between items-center pb-4 border-b border-white/5">
                      <div className="flex items-center gap-3 text-white/50"><CalendarDays size={16}/> <span className="text-[10px] uppercase tracking-widest font-bold">Date</span></div>
                      <p className="text-white font-medium">{new Date(selectedDate.split('-')[0], selectedDate.split('-')[1]-1, selectedDate.split('-')[2]).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric'})}</p>
                    </div>
                    
                    <div className="flex justify-between items-center pb-4 border-b border-white/5">
                      <div className="flex items-center gap-3 text-white/50"><Clock size={16}/> <span className="text-[10px] uppercase tracking-widest font-bold">Time</span></div>
                      <p className="text-white font-medium">{selectedTime}</p>
                    </div>
                    
                    <div className="flex justify-between items-center pb-4 border-b border-white/5">
                      <div className="flex items-center gap-3 text-white/50"><Users size={16}/> <span className="text-[10px] uppercase tracking-widest font-bold">Party</span></div>
                      <p className="text-white font-medium">{guestCount} Guests</p>
                    </div>

                    <div className="pt-2">
                      <div className="flex items-center gap-3 text-white/50 mb-3"><Map size={16}/> <span className="text-[10px] uppercase tracking-widest font-bold">Asset Allocation</span></div>
                      <div className="flex flex-wrap gap-2">
                        {selectedTables.map(t => (
                          <div key={t._id} className="bg-luxury-gold/20 border border-luxury-gold/30 text-luxury-gold px-3 py-1.5 rounded-lg text-xs font-bold">
                            Table {t.number}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-luxury-gold/20">
                    <button onClick={handleBook} disabled={loading} className="w-full bg-luxury-gold text-black py-4 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-white hover:shadow-[0_0_30px_rgba(197,160,89,0.5)] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                      {loading ? <Loader2 size={16} className="animate-spin" /> : 'Confirm Booking'}
                    </button>
                    <button onClick={() => { setStep(4); playSFX('click'); }} className="w-full mt-3 py-3 text-white/40 hover:text-white text-[10px] uppercase tracking-widest font-bold transition-colors">
                      Edit Selection
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── STEP 6: SUCCESS ── */}
        {step === 6 && confirmationData && (
          <motion.div key="step6" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="max-w-2xl mx-auto glass-panel p-12 text-center relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
            
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20 }} className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-8 border border-emerald-500/30 relative z-10">
              <CheckCircle2 className="text-emerald-400" size={48} />
            </motion.div>
            
            <h2 className="text-5xl font-serif text-white mb-6 relative z-10">Reservation Confirmed</h2>
            <p className="text-white/60 mb-10 max-w-md mx-auto text-lg leading-relaxed relative z-10">
              Your tables are secured. We look forward to hosting you at Aura Reserve. A confirmation has been sent to <span className="text-luxury-gold font-medium">{email}</span>.
            </p>
            
            <div className="inline-block bg-black/60 border border-white/10 rounded-3xl px-10 py-6 mb-12 relative z-10 backdrop-blur-xl">
               <p className="text-white/40 text-[10px] uppercase tracking-widest mb-2 font-bold">Reservation ID</p>
               <p className="text-3xl font-mono text-luxury-gold tracking-widest">{confirmationData._id.slice(-8).toUpperCase()}</p>
            </div>

            <button onClick={() => window.location.reload()} className="block mx-auto px-12 bg-white text-black py-4 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-luxury-gold transition-all relative z-10">
              Return to Homepage
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default Reservations;
