import express from 'express';
import mongoose from 'mongoose';
import Visitor from '../models/Visitor.js';
import Order from '../models/Order.js';
import Reservation from '../models/Reservation.js';
import User from '../models/User.js';
import MenuItem from '../models/MenuItem.js';

const router = express.Router();

// Helper to get date range
const getDateRange = (range) => {
  const now = new Date();
  const start = new Date(now);
  
  switch(range) {
    case '7d': start.setDate(now.getDate() - 7); break;
    case '30d': start.setDate(now.getDate() - 30); break;
    case '6m': start.setMonth(now.getMonth() - 6); break;
    case '1y': start.setFullYear(now.getFullYear() - 1); break;
    case 'today':
    default:
      start.setHours(0, 0, 0, 0);
      break;
  }
  return { start, now };
};

// Track visitor (called by frontend on route change)
router.post('/track', async (req, res) => {
  try {
    const { sessionId, path, device, browser } = req.body;
    if (!sessionId || !path) return res.status(400).json({ message: 'Missing sessionId or path' });

    let visitor = await Visitor.findOne({ sessionId });
    
    if (!visitor) {
      visitor = new Visitor({ sessionId, device, browser, ipAddress: req.ip, pagesVisited: [{ path }] });
    } else {
      visitor.pagesVisited.push({ path });
      visitor.lastActive = new Date();
      visitor.sessionDuration = Math.floor((visitor.lastActive - visitor.startTime) / 1000);
    }
    
    await visitor.save();
    
    const io = req.app.get('io');
    if (io) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todaysVisitors = await Visitor.countDocuments({ createdAt: { $gte: today } });
      io.emit('analytics_update', { type: 'visitors', count: todaysVisitors });
    }

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Advanced Metrics
router.get('/metrics', async (req, res) => {
  try {
    const timeRange = req.query.timeRange || 'today';
    const { start } = getDateRange(timeRange);

    const ordersQuery = { createdAt: { $gte: start }, status: { $ne: 'Cancelled' } };
    const periodOrders = await Order.find(ordersQuery);
    
    const revenue = periodOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const aov = periodOrders.length > 0 ? (revenue / periodOrders.length) : 0;

    const activeOrdersCount = await Order.countDocuments({ status: { $in: ['Pending', 'Preparing', 'Ready'] } });
    const upcomingReservationsCount = await Reservation.countDocuments({ 
        $or: [ { date: { $gte: new Date() } }, { status: { $in: ['Pending', 'Confirmed', 'Approved', 'Seated', 'Occupied'] } } ]
    });
    
    const totalVisitors = await Visitor.countDocuments({ createdAt: { $gte: start } });

    const codOrders = await Order.countDocuments({ createdAt: { $gte: start }, paymentMethod: 'Cash' });
    const onlineOrders = await Order.countDocuments({ createdAt: { $gte: start }, paymentMethod: 'Online' });

    const completedOrders = await Order.countDocuments({ createdAt: { $gte: start }, status: 'Delivered' });
    const cancelledOrders = await Order.countDocuments({ createdAt: { $gte: start }, status: 'Cancelled' });
    const pendingOrders = await Order.countDocuments({ createdAt: { $gte: start }, status: 'Pending' });

    // Customer Insights: Repeat vs New
    // Group orders by user to find those with > 1 order
    const userOrderCounts = await Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' } } },
        { $group: { _id: "$user", count: { $sum: 1 } } }
    ]);
    const repeatCount = userOrderCounts.filter(u => u.count > 1).length;
    const newCount = userOrderCounts.filter(u => u.count === 1).length;
    const totalC = repeatCount + newCount || 1;
    const repeatPercentage = Math.round((repeatCount / totalC) * 100);

    res.json({
      revenue,
      ordersCount: periodOrders.length,
      aov: Math.round(aov),
      activeOrdersCount,
      upcomingReservationsCount,
      totalVisitors,
      customerInsights: {
        repeatPercentage,
        newCount,
        repeatCount
      },
      paymentStats: { cod: codOrders, online: onlineOrders },
      orderStats: { completed: completedOrders, cancelled: cancelledOrders, pending: pendingOrders }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Advanced Charts & Insights
router.get('/charts', async (req, res) => {
  try {
    const timeRange = req.query.timeRange || 'today';
    const { start } = getDateRange(timeRange);

    const ordersQuery = { createdAt: { $gte: start }, status: { $ne: 'Cancelled' } };
    const periodOrders = await Order.find(ordersQuery);

    // 1. Revenue Chart Data
    let revenueChartData = [];
    const revenueMap = {};

    if (timeRange === 'today') {
      // Group by Hour
      for (let i = 0; i < 24; i++) revenueMap[i] = 0;
      periodOrders.forEach(order => {
          const hour = new Date(order.createdAt).getHours();
          revenueMap[hour] += (order.totalAmount || 0);
      });
      revenueChartData = Object.keys(revenueMap)
          .filter(h => revenueMap[h] > 0 || parseInt(h) >= 8)
          .map(h => ({ time: `${h.padStart(2, '0')}:00`, amount: revenueMap[h] }));
    } else {
      // Group by Day or Month depending on range
      periodOrders.forEach(order => {
        const d = new Date(order.createdAt);
        const key = timeRange === '1y' 
            ? `${d.toLocaleString('default', { month: 'short' })}`
            : `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
        revenueMap[key] = (revenueMap[key] || 0) + (order.totalAmount || 0);
      });
      revenueChartData = Object.keys(revenueMap).map(k => ({ time: k, amount: revenueMap[k] }));
    }

    // 2. Best Sellers (Item Aggregation)
    const itemSalesMap = {};
    const itemRevenueMap = {};
    periodOrders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
                const name = item.name || 'Unknown Item';
                const qty = item.quantity || 1;
                const rev = (item.price || 0) * qty;
                itemSalesMap[name] = (itemSalesMap[name] || 0) + qty;
                itemRevenueMap[name] = (itemRevenueMap[name] || 0) + rev;
            });
        }
    });

    const sortedItems = Object.entries(itemSalesMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
    
    // Fetch images for top items
    const topItemsData = [];
    for (const [name, qty] of sortedItems) {
        const menuItem = await MenuItem.findOne({ name });
        topItemsData.push({
            name,
            qty,
            revenue: itemRevenueMap[name],
            image: menuItem?.images?.[0] || menuItem?.image || 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=200'
        });
    }

    // 3. Peak Times (Busiest Hours overall in range)
    const hourMap = {};
    periodOrders.forEach(o => {
        const h = new Date(o.createdAt).getHours();
        hourMap[h] = (hourMap[h] || 0) + 1;
    });
    
    const sortedHours = Object.entries(hourMap).sort((a, b) => b[1] - a[1]);
    let peakTimeString = "Insufficient Data";
    if (sortedHours.length > 0) {
        const peakHour = parseInt(sortedHours[0][0]);
        // Formulate range, e.g., 7:00 PM - 8:00 PM
        const formatHour = (h) => {
            const ampm = h >= 12 ? 'PM' : 'AM';
            const h12 = h % 12 || 12;
            return `${h12}:00 ${ampm}`;
        };
        peakTimeString = `${formatHour(peakHour)} - ${formatHour(peakHour + 1)}`;
    }

    // 4. Table Analytics (Reservations)
    const resQuery = { createdAt: { $gte: start }, status: { $in: ['Confirmed', 'Approved', 'Seated', 'Occupied', 'Completed'] } };
    const periodReservations = await Reservation.find(resQuery);
    
    const tableMap = {};
    periodReservations.forEach(r => {
        if (r.tables && Array.isArray(r.tables)) {
            r.tables.forEach(tId => {
                tableMap[tId] = (tableMap[tId] || 0) + 1;
            });
        } else if (r.table) {
            tableMap[r.table] = (tableMap[r.table] || 0) + 1;
        }
    });
    
    let mostUsedTableId = "N/A";
    const sortedTables = Object.entries(tableMap).sort((a, b) => b[1] - a[1]);
    if (sortedTables.length > 0) {
        const favTable = await mongoose.model('Table').findById(sortedTables[0][0]);
        mostUsedTableId = favTable?.number || sortedTables[0][0];
    }
    const occupiedCount = await Reservation.countDocuments({ status: { $in: ['Seated', 'Occupied'] } });

    res.json({
      revenueChartData,
      topItemsData,
      peakTime: peakTimeString,
      tableStats: {
        mostUsedTableId,
        occupiedCount
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Live Activity Feed
router.get('/live-feed', async (req, res) => {
    try {
        const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(10).populate('user', 'name');
        const recentRes = await Reservation.find().sort({ createdAt: -1 }).limit(10).populate('tables').populate('user', 'name');
        
        const feed = [
            ...recentOrders.map(o => ({
                id: `o-${o._id}`,
                type: 'Order',
                title: 'New Order Placed',
                desc: `${o.items?.length || 0} items - ₹${o.totalAmount}`,
                timestamp: o.createdAt,
                status: o.status
            })),
            ...recentRes.map(r => ({
                id: `r-${r._id}`,
                type: 'Reservation',
                title: 'Reservation Booked',
                desc: `Tables ${r.tables?.map(t => t.number).join(', ') || 'TBD'} for ${r.partySize} guests`,
                timestamp: r.createdAt,
                status: r.status
            }))
        ];

        feed.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        res.json(feed.slice(0, 15));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
