import mongoose, { Schema, model, models } from 'mongoose';

const TableSchema = new Schema({
  name: { type: String, required: true },
  capacity: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Table = models.Table || model('Table', TableSchema);

export default Table;
