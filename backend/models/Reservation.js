import mongoose from 'mongoose';

const ReservationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  tables: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true }],
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  duration: { type: Number, default: 90 }, // in minutes
  partySize: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Cancelled', 'Completed', 'Occupied', 'Cleaning', 'Blocked', 'Confirmed', 'Seated'], default: 'Pending' },
  seatingPreference: { type: String },
  ambiencePreference: { type: String },
  diningPurpose: { type: String, enum: ['Dining', 'Business', 'Celebration', 'Date', 'Casual', 'Workspace'], default: 'Dining' },
  celebrationNotes: { type: String },
  specialRequests: { type: String }
}, { timestamps: true });

// Double-booking prevention is handled via time-overlap query in the route.
// Unique indexes on array fields (tables[]) cause false E11000 duplicate key errors in MongoDB.
ReservationSchema.index({ date: 1, timeSlot: 1 }); // non-unique, for query performance only

export default mongoose.model('Reservation', ReservationSchema);
