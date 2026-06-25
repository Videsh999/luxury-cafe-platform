import mongoose from 'mongoose';

const GuestMemorySchema = new mongoose.Schema({
  name: { type: String },
  favoriteDrinks: [{ type: String }],
  dietaryPreference: { type: String }, // Veg / Non-Veg / Vegan
  spiceLevel: { type: String },        // None / Mild / Medium / Hot
  preferredSeating: { type: String },  // Window / VIP / Outdoor / etc.
  allergies: [{ type: String }],
  lastOrderedItems: [{ type: String }],
  visitCount: { type: Number, default: 1 },
  specialOccasions: [{ type: String }],
}, { _id: false });

const ConversationSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true, index: true },
  messages: [{
    role: { type: String, enum: ['user', 'model'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  guestMemory: { type: GuestMemorySchema, default: () => ({}) }
}, { timestamps: true });

export default mongoose.model('Conversation', ConversationSchema);
