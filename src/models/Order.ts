import mongoose, { Schema, model, models } from 'mongoose';

const OrderItemSchema = new Schema({
  menuItem: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: false },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  extras: [{
    name: { type: String },
    price: { type: Number },
    quantity: { type: Number, default: 1 }
  }],
  sauces: [{ type: String }],
});

const OrderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [OrderItemSchema],
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'preparing', 'ready', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'failed', 'refunded'],
    default: 'unpaid'
  },
  stripeSessionId: { type: String },
  specialInstructions: { type: String },
}, { timestamps: true });

const Order = models.Order || model('Order', OrderSchema);

export default Order;
