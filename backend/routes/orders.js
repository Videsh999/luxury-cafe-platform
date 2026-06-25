import express from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order.js';

const router = express.Router();

// In-memory mock storage
let mockOrders = [];

// ── Pickup token generator ────────────────────────────────────────────────────
const genPickupToken = () => {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const l1 = letters[Math.floor(Math.random() * letters.length)];
  const l2 = letters[Math.floor(Math.random() * letters.length)];
  const num = Math.floor(Math.random() * 90) + 10;
  return `${l1}${l2}${num}`;
};

// ── Hosts pool ────────────────────────────────────────────────────────────────
const HOSTS = ['Sebastian', 'Julian', 'Alexander', 'Isabella', 'Marcus', 'Elena'];
const pickHost = () => HOSTS[Math.floor(Math.random() * HOSTS.length)];

// ── Build order data from request ─────────────────────────────────────────────
const buildOrderData = (body, paymentMode) => {
  const {
    items, totalAmount, customerName, mobileNumber, guestCount, user,
    orderType = 'Dine In',
    tableNumber, tableId, tableName, tableArea, tableType,
    deliveryAddress,
  } = body;

  let maxPrepTime = 0;
  if (items?.length) maxPrepTime = Math.max(...items.map(i => i.prepTime || 5));
  const estimatedPrepTime = maxPrepTime + (items?.length || 0) * 2;

  const base = {
    user:              user || null,
    customerName,
    mobileNumber,
    guestCount:        guestCount || 1,
    items,
    totalAmount,
    orderType,
    status:            'New Order',
    paymentMode,
    paymentStatus:     paymentMode === 'COD' ? 'COD Pending' : 'Pending',
    estimatedPrepTime,
    hostName:          pickHost(),
    waitTime:          `${estimatedPrepTime} – ${estimatedPrepTime + 5} Min`,
  };

  if (orderType === 'Dine In') {
    Object.assign(base, {
      tableNumber,
      tableId,
      tableName,
      tableArea,
      tableType,
      serviceArea: tableArea,
    });
  } else if (orderType === 'Delivery') {
    base.deliveryAddress = deliveryAddress;
    base.tableNumber     = '—';
    base.serviceArea     = 'Delivery';
  } else {
    // Takeaway
    base.pickupToken = genPickupToken();
    base.tableNumber = '—';
    base.serviceArea = 'Takeaway Counter';
  }

  return base;
};

// ── Validate Dine In has table & items have valid ObjectIds ───────────────────
const validateOrder = (body) => {
  const { orderType, tableNumber, deliveryAddress, items } = body;
  
  if (items && Array.isArray(items)) {
    for (let item of items) {
      if (item.menuItem && !mongoose.Types.ObjectId.isValid(item.menuItem)) {
        return 'Invalid menu item ID detected. Please clear your cart and try again.';
      }
    }
  }

  if (orderType === 'Dine In' && !tableNumber) {
    return 'Please select your table number before placing the order.';
  }
  if (orderType === 'Delivery' && !deliveryAddress?.trim()) {
    return 'Please provide a delivery address.';
  }
  return null;
};

// ── POST /api/orders  (online payment placeholder) ───────────────────────────
router.post('/', async (req, res) => {
  try {
    const err = validateOrder(req.body);
    if (err) return res.status(400).json({ message: err });

    const orderData = buildOrderData(req.body, req.body.paymentMode || 'Online');

    if (mongoose.connection.readyState !== 1) {
      const mockOrder = { _id: `mock_${Date.now()}`, ...orderData, createdAt: new Date() };
      mockOrders.unshift(mockOrder);
      req.app.get('io')?.emit('new_order', mockOrder);
      return res.status(201).json(mockOrder);
    }

    const order = new Order(orderData);
    const created = await order.save();
    const populated = await Order.findById(created._id).populate('items.menuItem');
    req.app.get('io')?.emit('new_order', populated);
    res.status(201).json(populated);
  } catch (error) {
    console.error('Create order error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// ── POST /api/orders/cod ──────────────────────────────────────────────────────
router.post('/cod', async (req, res) => {
  try {
    const err = validateOrder(req.body);
    if (err) return res.status(400).json({ message: err });

    const orderData = buildOrderData(req.body, 'COD');

    if (mongoose.connection.readyState !== 1) {
      const mockOrder = { _id: `mock_cod_${Date.now()}`, ...orderData, createdAt: new Date() };
      mockOrders.unshift(mockOrder);
      req.app.get('io')?.emit('new_order', mockOrder);
      return res.status(201).json(mockOrder);
    }

    const order = new Order(orderData);
    const created = await order.save();
    const populated = await Order.findById(created._id).populate('items.menuItem');
    req.app.get('io')?.emit('new_order', populated);
    res.status(201).json(populated);
  } catch (error) {
    console.error('COD order error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// ── GET /api/orders ───────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json(mockOrders);
    const orders = await Order.find({})
      .populate('items.menuItem')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── GET /api/orders/:id ───────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    if (req.params.id.startsWith('mock_')) {
      const found = mockOrders.find(o => o._id === req.params.id);
      return found
        ? res.json(found)
        : res.status(404).json({ message: 'Order not found' });
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ message: 'Invalid order ID' });

    const order = await Order.findById(req.params.id).populate('items.menuItem');
    order ? res.json(order) : res.status(404).json({ message: 'Order not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── PATCH /api/orders/:id/status ─────────────────────────────────────────────
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (req.params.id.startsWith('mock_')) {
      const idx = mockOrders.findIndex(o => o._id === req.params.id);
      if (idx !== -1) {
        mockOrders[idx].status = status;
        req.app.get('io')?.emit('order_status_update', mockOrders[idx]);
        return res.json(mockOrders[idx]);
      }
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('items.menuItem');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    req.app.get('io')?.emit('order_status_update', order);
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── PATCH /api/orders/:id/payment ────────────────────────────────────────────
router.patch('/:id/payment', async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    if (req.params.id.startsWith('mock_')) {
      const idx = mockOrders.findIndex(o => o._id === req.params.id);
      if (idx !== -1) { mockOrders[idx].paymentStatus = paymentStatus; return res.json(mockOrders[idx]); }
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { paymentStatus }, { new: true }).populate('items.menuItem');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── DELETE /api/orders/:id ────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    if (req.params.id.startsWith('mock_')) {
      mockOrders = mockOrders.filter(o => o._id !== req.params.id);
      return res.json({ message: 'Order deleted' });
    }
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
