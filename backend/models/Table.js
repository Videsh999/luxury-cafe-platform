import mongoose from 'mongoose';

const TableSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  capacity: { type: Number, required: true },
  type: { type: String, enum: ['Standard', 'VIP', 'Lounge', 'Terrace', 'Booth', 'Counter', 'Family', 'Quiet'], default: 'Standard' },
  area: { type: String }, // e.g., "Window Lounge", "VIP Gold Lounge"
  name: { type: String },
  description: { type: String },
  tags: [{ type: String }], // e.g., ["Romantic", "City View", "Private"]
  image: { type: String },
  location: { x: Number, y: Number }, 
  status: { type: String, enum: ['Available', 'Reserved', 'Occupied', 'Cleaning', 'Blocked'], default: 'Available' },
  reservationStartTime: { type: Date },
  reservationEndTime: { type: Date },
  currentReservation: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' }
}, { timestamps: true });

export default mongoose.model('Table', TableSchema);
