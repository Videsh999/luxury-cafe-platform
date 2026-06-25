import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerName: { type: String },
  mobileNumber: { type: String },
  guestCount:   { type: Number, default: 1 },

  // ── Order type ────────────────────────────────────────────────────────────
  orderType: {
    type:    String,
    enum:    ['Dine In', 'Takeaway', 'Delivery'],
    default: 'Dine In',
  },

  // ── Table info (Dine In only) ─────────────────────────────────────────────
  tableNumber:  { type: String },      // e.g. "Table 05", "VIP Table 02"
  tableId:      { type: String },      // internal table _id
  tableName:    { type: String },      // luxury name, e.g. "Royal Circle"
  tableArea:    { type: String },      // area, e.g. "VIP Gold Lounge"
  tableType:    { type: String },      // type, e.g. "VIP", "Lounge"
  serviceArea:  { type: String },      // keep for backward compat
  hostName:     { type: String },
  waitTime:     { type: String },

  // ── Delivery address (Delivery only) ─────────────────────────────────────
  deliveryAddress: { type: String },

  // ── Pickup token (Takeaway only) ──────────────────────────────────────────
  pickupToken:  { type: String },

  // ── Items ─────────────────────────────────────────────────────────────────
  items: [
    {
      menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
      quantity: { type: Number, required: true },
      price:    { type: Number, required: true },
      prepTime: { type: Number },
    },
  ],

  totalAmount: { type: Number, required: true },

  // ── Status ────────────────────────────────────────────────────────────────
  status: {
    type:    String,
    enum:    ['New Order', 'Preparing', 'Ready', 'Served', 'Completed', 'Rejected'],
    default: 'New Order',
  },
  paymentStatus: {
    type:    String,
    enum:    ['Pending', 'Paid', 'Failed', 'COD Pending'],
    default: 'Pending',
  },
  paymentMode: {
    type:    String,
    enum:    ['Online', 'COD', 'UPI', 'Card', 'Wallet'],
    default: 'COD',
  },

  razorpayOrderId:  { type: String },
  razorpayPaymentId:{ type: String },
  estimatedPrepTime:{ type: Number },

}, { timestamps: true });

export default mongoose.model('Order', OrderSchema);
