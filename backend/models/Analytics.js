import mongoose from 'mongoose';

const AnalyticsSchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true }, // Should be normalized to 00:00:00 of the day
  totalRevenue: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  totalReservations: { type: Number, default: 0 },
  totalVisitors: { type: Number, default: 0 },
  peakHours: {
    type: Map,
    of: Number, // key: hour (0-23), value: count
    default: {}
  }
}, { timestamps: true });

export default mongoose.model('Analytics', AnalyticsSchema);
