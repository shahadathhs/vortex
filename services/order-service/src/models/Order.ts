import { Schema, model } from 'mongoose';

import { IOrder } from '../types/order.interface';

const orderItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  { _id: false },
);

const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'completed',
  'cancelled',
] as const;

const orderSchema = new Schema<IOrder>(
  {
    userId: { type: String, required: true },
    userEmail: { type: String },
    items: {
      type: [orderItemSchema],
      required: true,
      default: [],
    },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: 'pending',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  },
);

export const Order = model<IOrder>('Order', orderSchema);
