import mongoose, { Schema, model, models } from 'mongoose';

const ReviewSchema = new Schema({
  name: { type: String, required: true },
  role: { type: String, default: 'Client' },
  review: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true });

const Review = models.Review || model('Review', ReviewSchema);

export default Review;
