import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Search,
  Filter,
  MapPin,
  LayoutGrid,
  List,
  Coffee,
  ShieldAlert,
  Trash2,
  RefreshCw,
  MoreVertical,
  ChevronRight,
  Activity
} from 'lucide-react';
import { io } from 'socket.io-client';

const ReservationsManager = () => {
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list');
  const [filter, setFilter] = useState('All');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    fetchData();

    const socket = io('http://localhost:5001');
    socket.on('reservation_update', fetchData);
    socket.on('table_update', fetchData);

    return () => socket.disconnect();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resRes, tableRes] = await Promise.all([
        fetch('http://localhost:5001/api/reservations'),
        fetch('http://localhost:5001/api/tables')
      ]);
      setReservations(await resRes.json());
      setTables(await tableRes.json());
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await fetch(`http://localhost:5001/api/reservations/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchData();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleDelete = async (id) => {
    if (confirmDeleteId !== id) {
      // First click: enter confirm mode
      setConfirmDeleteId(id);
      // Auto-cancel confirm after 4 seconds
      setTimeout(() => setConfirmDeleteId(prev => prev === id ? null : prev), 4000);
      return;
    }
    // Second click: actually delete
    setConfirmDeleteId(null);
    try {
      const res = await fetch(`http://localhost:5001/api/reservations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        // Immediately remove from local state for instant feedback
        setReservations(prev => prev.filter(r => r._id !== id));
        fetchData();
      } else {
        const data = await res.json().catch(() => ({}));
        console.error('Delete failed:', data.message);
      }
    } catch (err) {
      console.error('Error deleting reservation:', err);
    }
  };

  const handleTableOverride = async (tableId, status) => {
    try {
      await fetch(`http://localhost:5001/api/tables/${tableId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchData();
    } catch (err) {
      console.error("Error overriding table:", err);
    }
  };

  const getTableStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'border-green-500/20 bg-green-500/5 text-green-400';
      case 'Reserved': return 'border-luxury-gold/40 bg-luxury-gold/10 text-luxury-gold';
      case 'Occupied': return 'border-blue-500/30 bg-blue-500/10 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.1)]';
      case 'Cleaning': return 'border-orange-500/30 bg-orange-500/10 text-orange-400';
      case 'Blocked': return 'border-red-500/30 bg-red-500/10 text-red-400';
      default: return 'border-white/10 bg-white/5 text-white/40';
    }
  };

  const filteredReservations = reservations.filter(r =>
    filter === 'All' ? (r.status !== 'Cancelled') : r.status === filter
  );

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-12 pb-20"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h2 className="text-4xl font-serif text-white tracking-tight">Occupancy Command</h2>
          <div className="flex items-center gap-3 mt-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-black">System Live • Floor Intelligence</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
           <motion.button 
             whileHover={{ rotate: 180 }}
             onClick={fetchData} 
             className="p-4 bg-white/5 rounded-2xl border border-white/10 text-white/40 hover:text-luxury-gold hover:border-luxury-gold/50 transition-all duration-500"
           >
             <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
           </motion.button>
           <div className="flex bg-black/40 rounded-2xl border border-white/10 p-1.5 backdrop-blur-3xl shadow-inner">
            <button 
              onClick={() => setViewMode('list')}
              className={`px-6 py-2.5 rounded-xl flex items-center gap-3 text-[10px] uppercase tracking-widest font-black transition-all duration-500 ${viewMode === 'list' ? 'bg-luxury-gold text-black shadow-lg' : 'text-white/30 hover:text-white'}`}
            >
              <List size={14} /> List View
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`px-6 py-2.5 rounded-xl flex items-center gap-3 text-[10px] uppercase tracking-widest font-black transition-all duration-500 ${viewMode === 'grid' ? 'bg-luxury-gold text-black shadow-lg' : 'text-white/30 hover:text-white'}`}
            >
              <LayoutGrid size={14} /> Intelligence Map
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        {[
          { label: 'Available', count: tables.filter(t => t.status === 'Available').length, color: 'text-green-400', glow: 'bg-green-500/20' },
          { label: 'Reserved', count: tables.filter(t => t.status === 'Reserved').length, color: 'text-luxury-gold', glow: 'bg-luxury-gold/20' },
          { label: 'Occupied', count: tables.filter(t => t.status === 'Occupied').length, color: 'text-blue-400', glow: 'bg-blue-500/20' },
          { label: 'Cleaning', count: tables.filter(t => t.status === 'Cleaning').length, color: 'text-orange-400', glow: 'bg-orange-500/20' },
          { label: 'Blocked', count: tables.filter(t => t.status === 'Blocked').length, color: 'text-red-400', glow: 'bg-red-500/20' },
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-8 relative group overflow-hidden border-white/5"
          >
             <div className={`absolute top-0 right-0 w-20 h-20 ${stat.glow} rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
             <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-3 font-bold">{stat.label}</p>
             <p className={`text-4xl font-display font-black tracking-tighter ${stat.color}`}>{stat.count}</p>
          </motion.div>
        ))}
      </div>

      {viewMode === 'grid' ? (
        /* Floor Map View */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
           <AnimatePresence>
             {tables.map((table, idx) => (
               <motion.div
                 key={table._id}
                 layout
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: idx * 0.05 }}
                 className={`relative rounded-[2.5rem] border-2 p-8 transition-all duration-700 group overflow-hidden flex flex-col h-64 ${getTableStatusColor(table.status)}`}
               >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                  
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.2em] font-black opacity-30 mb-1">Asset</div>
                      <div className="text-5xl font-serif">{table.number}</div>
                    </div>
                    {table.status === 'Reserved' && (
                      <motion.div 
                        animate={{ scale: [1, 1.1, 1] }} 
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-3 h-3 rounded-full bg-luxury-gold shadow-[0_0_10px_rgba(197,160,89,1)]" 
                      />
                    )}
                  </div>

                  <div className="mt-4 text-[10px] uppercase tracking-[0.3em] font-bold opacity-60 relative z-10 flex items-center gap-2">
                    <MapPin size={10} className="text-luxury-gold" /> {table.area}
                  </div>
                  
                  {/* Premium Action Menu */}
                  <div className="mt-auto grid grid-cols-2 gap-2 relative z-10 pt-6">
                     {['Available', 'Occupied', 'Cleaning', 'Blocked'].map(s => (
                        <button
                          key={s}
                          onClick={() => handleTableOverride(table._id, s)}
                          className={`px-3 py-2 rounded-xl text-[8px] uppercase tracking-widest font-black transition-all duration-500 border border-transparent ${
                            table.status === s 
                              ? 'bg-white text-black font-black' 
                              : 'bg-white/5 text-white/40 hover:border-white/20 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {s}
                        </button>
                     ))}
                  </div>

                  {table.status === 'Reserved' && table.currentReservation && (
                    <div className="absolute inset-x-0 top-0 h-1 bg-luxury-gold/30">
                       <motion.div 
                        initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 5, repeat: Infinity }}
                        className="h-full bg-luxury-gold" 
                       />
                    </div>
                  )}
               </motion.div>
             ))}
           </AnimatePresence>
        </div>
      ) : (
        /* List View */
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-panel border-white/5 overflow-hidden shadow-luxury"
        >
           <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                   <th className="px-10 py-8 text-[11px] uppercase tracking-[0.3em] font-black text-white/30">Guest Identity</th>
                   <th className="px-10 py-8 text-[11px] uppercase tracking-[0.3em] font-black text-white/30">Temporal Window</th>
                   <th className="px-10 py-8 text-[11px] uppercase tracking-[0.3em] font-black text-white/30">Asset Allocation</th>
                   <th className="px-10 py-8 text-[11px] uppercase tracking-[0.3em] font-black text-white/30">State</th>
                   <th className="px-10 py-8 text-[11px] uppercase tracking-[0.3em] font-black text-white/30">Authorization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                 {filteredReservations.map(res => (
                   <tr key={res._id} className="group hover:bg-white/[0.03] transition-all duration-500">
                      <td className="px-10 py-8">
                         <p className="text-white font-serif text-lg tracking-wide group-hover:text-luxury-gold transition-colors">{res.customerName}</p>
                         <div className="flex items-center gap-3 mt-1.5 opacity-40">
                           <Users size={12} />
                           <span className="text-[10px] uppercase tracking-widest font-bold">{res.partySize} Members • {res.diningPurpose}</span>
                         </div>
                      </td>
                      <td className="px-10 py-8">
                         <div className="flex items-center gap-3 text-white/80 group-hover:text-white transition-colors">
                           <Clock size={14} className="text-luxury-gold" />
                           <span className="text-sm font-medium">{res.timeSlot}</span>
                         </div>
                         <p className="text-white/20 text-[10px] mt-1.5 uppercase tracking-widest font-black">{new Date(res.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </td>
                      <td className="px-10 py-8">
                         <p className="text-white text-sm font-medium">Suite {res.tables?.map(t => t.number).join(' & ') || res.table?.number || 'TBD'}</p>
                         <p className="text-white/20 text-[10px] mt-1.5 uppercase tracking-widest font-black">{res.tables?.[0]?.area || res.table?.area || 'UNASSIGNED'}</p>
                      </td>
                      <td className="px-10 py-8">
                         <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-500 ${
                           (res.status === 'Confirmed' || res.status === 'Approved') ? 'border-green-500/20 text-green-400 bg-green-500/5' :
                           (res.status === 'Seated' || res.status === 'Occupied') ? 'border-blue-500/20 text-blue-400 bg-blue-500/5' :
                           res.status === 'Pending' ? 'border-luxury-gold/20 text-luxury-gold bg-luxury-gold/5 shadow-[0_0_15px_rgba(197,160,89,0.1)]' :
                           res.status === 'Completed' ? 'border-white/20 text-white/60 bg-white/5' :
                           'border-red-500/20 text-red-400 bg-red-500/5'
                         }`}>
                           {res.status}
                         </span>
                      </td>
                      <td className="px-10 py-8">
                         <div className="flex gap-3">
                            <AnimatePresence>
                              {res.status === 'Pending' && (
                                <motion.button 
                                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                  onClick={() => handleStatusUpdate(res._id, 'Confirmed')} 
                                  className="w-10 h-10 bg-green-500/10 text-green-400 rounded-xl border border-green-500/20 hover:bg-green-500 hover:text-black transition-all flex items-center justify-center"
                                >
                                  <CheckCircle2 size={18} />
                                </motion.button>
                              )}
                            </AnimatePresence>
                            <motion.button 
                              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                              onClick={() => handleStatusUpdate(res._id, 'Seated')} 
                              className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center"
                            >
                               <Users size={18} />
                            </motion.button>
                            <motion.button 
                              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                              onClick={() => handleStatusUpdate(res._id, 'Completed')} 
                              className="w-10 h-10 bg-white/5 text-white/30 rounded-xl border border-white/10 hover:bg-white hover:text-black transition-all flex items-center justify-center"
                            >
                               <CheckCircle2 size={18} />
                            </motion.button>
                             <motion.button 
                               whileHover={{ scale: 1.1 }}
                               whileTap={{ scale: 0.9 }}
                               onClick={() => handleDelete(res._id)}
                               title={confirmDeleteId === res._id ? 'Click again to permanently delete' : 'Delete this reservation'}
                               className={`w-10 h-10 rounded-xl border transition-all flex items-center justify-center font-bold text-xs ${
                                 confirmDeleteId === res._id
                                   ? 'bg-red-500 text-white border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse'
                                   : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500 hover:text-white'
                               }`}
                             >
                               {confirmDeleteId === res._id ? '✕' : <Trash2 size={16} />}
                             </motion.button>
                         </div>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ReservationsManager;
