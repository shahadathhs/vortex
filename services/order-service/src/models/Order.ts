import { Schema, model } from 'mongoose';

import { IOrder } from '../types/order.interface';

const orderSchema = new Schema<IOrder>(
  {
    userId: { type: String, required: true },
    productId: { type: String, required: true },
    quantity: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
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
