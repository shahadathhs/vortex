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
      transform(doc, ret) {
        ret.id = ret._id;
        delete (ret as any)._id;
        delete (ret as any).__v;
      },
    },
  },
);

export const Order = model<IOrder>('Order', orderSchema);
