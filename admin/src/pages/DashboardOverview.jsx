import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, ShoppingBag, Users, CalendarCheck, TrendingUp, Activity,
  RefreshCw, Star, Clock, Flame, PieChart, Bell, ChevronRight, UserPlus, Heart
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import RollingNumber from '../components/RollingNumber';
import axios from 'axios';
import { io } from 'socket.io-client';

const DashboardOverview = () => {
  const [timeRange, setTimeRange] = useState('today');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeUsers, setActiveUsers] = useState(0);

  const [metrics, setMetrics] = useState({
    revenue: 0, ordersCount: 0, aov: 0, activeOrdersCount: 0,
    upcomingReservationsCount: 0, totalVisitors: 0,
    customerInsights: { repeatPercentage: 0, newCount: 0, repeatCount: 0 },
    paymentStats: { cod: 0, online: 0 },
    orderStats: { completed: 0, cancelled: 0, pending: 0 }
  });

  const [chartData, setChartData] = useState({
    revenue: [], topItems: [], peakTime: "N/A",
    tableStats: { mostUsedTableId: "N/A", occupiedCount: 0 }
  });

  const [liveFeed, setLiveFeed] = useState([]);

  const fetchDashboardData = async () => {
    setIsRefreshing(true);
    try {
      const [metricsRes, chartsRes, feedRes] = await Promise.all([
        axios.get(`http://localhost:5001/api/analytics/metrics?timeRange=${timeRange}`),
        axios.get(`http://localhost:5001/api/analytics/charts?timeRange=${timeRange}`),
        axios.get(`http://localhost:5001/api/analytics/live-feed`)
      ]);
      
      setMetrics(metricsRes.data);
      setChartData({
        revenue: chartsRes.data.revenueChartData,
        topItems: chartsRes.data.topItemsData,
        peakTime: chartsRes.data.peakTime,
        tableStats: chartsRes.data.tableStats
      });
      setLiveFeed(feedRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  useEffect(() => {
    const socket = io('http://localhost:5001');
    
    socket.on('active_users_update', (count) => setActiveUsers(count));
    socket.on('analytics_update', (data) => {
      if (data.type === 'visitors' && timeRange === 'today') {
        setMetrics(prev => ({ ...prev, totalVisitors: data.count }));
      }
    });

    socket.on('new_order', () => { if(timeRange === 'today') fetchDashboardData() });
    socket.on('order_status_update', () => { if(timeRange === 'today') fetchDashboardData() });
    socket.on('reservation_update', () => { if(timeRange === 'today') fetchDashboardData() });

    return () => socket.disconnect();
  }, [timeRange]);

  const statCards = [
    { title: "Total Revenue", value: metrics.revenue, prefix: "₹", icon: <DollarSign size={20} />, trend: timeRange === 'today' ? "Live" : timeRange },
    { title: "Total Orders", value: metrics.ordersCount, icon: <ShoppingBag size={20} />, trend: timeRange === 'today' ? "Live" : timeRange },
    { title: "Avg Order Value", value: metrics.aov, prefix: "₹", icon: <TrendingUp size={20} />, trend: "AOV" },
    { title: "Active Visitors", value: metrics.totalVisitors, icon: <Users size={20} />, trend: "Traffic" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-[1600px] mx-auto pb-12">
      
      {/* Header & Time Filters */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-serif text-white mb-2">Business Intelligence</h1>
          <p className="text-white/40 text-xs font-light tracking-widest uppercase">Aura Reserve • Performance Analytics</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-black/40 border border-white/10 rounded-full p-1 backdrop-blur-md">
            {['today', '7d', '30d', '6m', '1y'].map((range) => (
              <button 
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${timeRange === range ? 'bg-luxury-gold text-black shadow-[0_0_20px_rgba(197,160,89,0.3)]' : 'text-white/40 hover:text-white'}`}
              >
                {range === 'today' ? 'Today' : range.toUpperCase()}
              </button>
            ))}
          </div>
          
          <button onClick={fetchDashboardData} className={`p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all ${isRefreshing ? 'opacity-50' : ''}`}>
            <RefreshCw size={16} className={`text-white/60 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-full backdrop-blur-xl">
             <Activity size={16} className="text-luxury-gold animate-pulse" />
             <span className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-bold">{activeUsers} Online</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Main Content (3 cols) */}
        <div className="xl:col-span-3 space-y-8">
          
          {/* KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, i) => (
              <motion.div key={i} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} className="glass-panel p-6 border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-luxury-gold/5 rounded-full blur-[40px] group-hover:bg-luxury-gold/10 transition-all"></div>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-luxury-gold group-hover:border-luxury-gold/50 transition-colors">
                    {stat.icon}
                  </div>
                  <span className="bg-white/5 text-white/40 px-3 py-1 rounded-full text-[9px] uppercase tracking-widest">{stat.trend}</span>
                </div>
                <h3 className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-bold mb-1">{stat.title}</h3>
                <p className="text-3xl font-display font-black text-white">
                  <RollingNumber value={stat.value || 0} prefix={stat.prefix} />
                </p>
              </motion.div>
            ))}
          </div>

          {/* Revenue Chart */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="glass-panel p-6 border-white/5 h-[400px]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-serif text-white flex items-center gap-2"><TrendingUp size={18} className="text-luxury-gold"/> Revenue Trajectory</h2>
              <span className="text-[10px] text-white/40 uppercase tracking-widest">Real-time Visualization</span>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.revenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c5a059" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#c5a059" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="time" stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', borderColor: 'rgba(197, 160, 89, 0.3)', borderRadius: '12px' }} itemStyle={{ color: '#c5a059' }} />
                <Area type="monotone" dataKey="amount" stroke="#c5a059" strokeWidth={3} fillOpacity={1} fill="url(#goldGrad)" animationDuration={1500} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Bottom Insights Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Best Sellers */}
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="glass-panel p-6 border-white/5 lg:col-span-2">
              <h2 className="text-lg font-serif text-white flex items-center gap-2 mb-6"><Star size={18} className="text-luxury-gold"/> Top Performing Menu</h2>
              <div className="space-y-4">
                {chartData.topItems.length === 0 ? (
                  <p className="text-white/30 text-xs text-center py-10 uppercase tracking-widest">No Sales Data</p>
                ) : (
                  chartData.topItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl hover:bg-white/10 transition-colors group">
                      <span className="w-6 text-center text-white/30 font-display text-lg font-black group-hover:text-luxury-gold">{i+1}</span>
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover border border-white/10" />
                      <div className="flex-1">
                        <h4 className="text-white text-sm font-bold">{item.name}</h4>
                        <p className="text-white/40 text-[10px] uppercase tracking-widest">{item.qty} Orders</p>
                      </div>
                      <div className="text-right pr-2">
                        <p className="text-luxury-gold font-display text-lg">₹{item.revenue.toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Micro Stats (Peak time & Customer Insights) */}
            <div className="space-y-6">
              
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="glass-panel p-6 border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-[40px]"></div>
                <h2 className="text-[10px] uppercase tracking-widest text-white/40 mb-2 flex items-center gap-2"><Flame size={12} className="text-red-400"/> Peak Hours</h2>
                <p className="text-2xl font-serif text-white mb-1">{chartData.peakTime}</p>
                <p className="text-[9px] uppercase tracking-[0.2em] text-white/30">Highest order volume time</p>
              </motion.div>

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="glass-panel p-6 border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-[40px]"></div>
                <h2 className="text-[10px] uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2"><Heart size={12} className="text-blue-400"/> Retention Rate</h2>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-4xl font-display font-black text-white">{metrics.customerInsights.repeatPercentage}%</span>
                  <span className="text-white/40 text-xs mb-1">Repeat</span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-4">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${metrics.customerInsights.repeatPercentage}%` }} transition={{ duration: 1.5 }} className="h-full bg-blue-400" />
                </div>
                <div className="flex justify-between mt-2 text-[9px] uppercase tracking-widest text-white/40">
                  <span>{metrics.customerInsights.repeatCount} Return</span>
                  <span>{metrics.customerInsights.newCount} New</span>
                </div>
              </motion.div>

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }} className="glass-panel p-6 border-white/5">
                <h2 className="text-[10px] uppercase tracking-widest text-white/40 mb-2 flex items-center gap-2"><PieChart size={12} className="text-purple-400"/> Table Analytics</h2>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white/60 text-xs">Occupied Now</span>
                  <span className="text-white font-bold">{chartData.tableStats.occupiedCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-xs">Most Popular</span>
                  <span className="text-luxury-gold font-bold">T-{chartData.tableStats.mostUsedTableId}</span>
                </div>
              </motion.div>

            </div>
          </div>
        </div>

        {/* Live Sidebar (1 col) */}
        <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="glass-panel border-white/5 flex flex-col overflow-hidden h-[calc(100vh-140px)] sticky top-6">
          <div className="p-6 border-b border-white/5 bg-black/20 flex justify-between items-center">
            <h2 className="text-lg font-serif text-white flex items-center gap-2"><Bell size={18} className="text-luxury-gold"/> Live Activity</h2>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          </div>
          
          <div className="flex-1 overflow-y-auto hide-scrollbar p-6 space-y-6">
            <AnimatePresence>
              {liveFeed.length === 0 ? (
                <p className="text-white/30 text-xs text-center py-10 uppercase tracking-widest">No recent activity</p>
              ) : (
                liveFeed.map((event, i) => (
                  <motion.div 
                    key={event.id}
                    initial={{ opacity: 0, x: -20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    className="relative pl-6"
                  >
                    {/* Timeline dot & line */}
                    <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-luxury-gold shadow-[0_0_10px_rgba(197,160,89,0.8)]" />
                    {i !== liveFeed.length - 1 && <div className="absolute left-[3px] top-4 bottom-[-24px] w-px bg-white/10" />}
                    
                    <div className="bg-white/5 border border-white/5 p-4 rounded-2xl hover:border-luxury-gold/30 hover:bg-white/10 transition-all cursor-pointer group">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] uppercase tracking-widest font-bold flex items-center gap-1 text-white/80">
                          {event.type === 'Order' ? <ShoppingBag size={10} className="text-luxury-gold" /> : <CalendarCheck size={10} className="text-blue-400" />}
                          {event.type}
                        </span>
                        <span className="text-[9px] text-white/30 tracking-wider">
                          {new Date(event.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      <p className="text-sm text-white font-serif mt-2 group-hover:text-luxury-gold transition-colors">{event.title}</p>
                      <p className="text-xs text-white/50 font-light mt-1">{event.desc}</p>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default DashboardOverview;
