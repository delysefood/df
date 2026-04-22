import mongoose, { Schema, model, models } from 'mongoose';

const MenuItemSchema = new Schema({
  name: {
    fr: { type: String, required: true },
    en: { type: String },
    es: { type: String },
    it: { type: String },
    ar: { type: String },
    de: { type: String },
    tr: { type: String },
    ru: { type: String },
  },
  description: {
    fr: { type: String, required: true },
    en: { type: String },
    es: { type: String },
    it: { type: String },
    ar: { type: String },
    de: { type: String },
    tr: { type: String },
    ru: { type: String },
  },
  price: { type: Number, required: true },
  category: { 
    type: String, 
    enum: ['starter', 'main', 'dessert', 'drink'], 
    required: true 
  },
  rating: { type: Number, default: 4.8, min: 1, max: 5 },
  reviewsCount: { type: Number, default: 124 },
  image: { type: String }, // Cloudinary URL
  isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

const MenuItem = models.MenuItem || model('MenuItem', MenuItemSchema);

export default MenuItem;
