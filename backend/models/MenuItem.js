import mongoose from 'mongoose';

const MenuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  images: [{ type: String }],
  rating: { type: Number, default: 5.0 },
  prepTime: { type: Number, required: true },
  ingredients: [{ type: String }],
  preparationStyle: { type: String },
  chefRecommendation: { type: String },
  isAvailable: { type: Boolean, default: true },
  calories: { type: Number, default: 0 },
  dietaryPreference: { type: String, enum: ['Veg', 'Non-Veg', 'Vegan'], default: 'Veg' },
  spiceLevel: { type: String, enum: ['None', 'Mild', 'Medium', 'Hot'], default: 'None' },
  badge: { type: String, enum: ['Popular', 'Chef Recommended', 'Today\'s Special', null], default: null }
}, { timestamps: true });

export default mongoose.model('MenuItem', MenuItemSchema);
