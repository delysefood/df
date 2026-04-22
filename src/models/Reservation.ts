import mongoose, { Schema, model, models } from 'mongoose';

const ReservationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  table: { type: Schema.Types.ObjectId, ref: 'Table', required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  guests: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled'], 
    default: 'pending' 
  },
  specialRequests: { type: String },
}, { timestamps: true });

const Reservation = models.Reservation || model('Reservation', ReservationSchema);

export default Reservation;
