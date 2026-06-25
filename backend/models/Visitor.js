import mongoose from 'mongoose';

const PageViewSchema = new mongoose.Schema({
  path: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const VisitorSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  device: { type: String },
  browser: { type: String },
  ipAddress: { type: String },
  pagesVisited: [PageViewSchema],
  startTime: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now },
  sessionDuration: { type: Number, default: 0 }, // in seconds
}, { timestamps: true });

export default mongoose.model('Visitor', VisitorSchema);
