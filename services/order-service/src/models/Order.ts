import mongoose from 'mongoose';

export interface OrderDoc extends mongoose.Document {
  userId: string;
  productId: string;
  quantity: number;
  totalPrice: number;
  status: string;
}

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    productId: { type: String, required: true },
    quantity: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    status: { type: String, required: true, default: 'pending' },
  },
  {
    toJSON: {
      transform(doc, ret) {
        (ret as any).id = (ret as any)._id;
        delete (ret as any)._id;
        delete (ret as any).__v;
      },
    },
    timestamps: true,
  },
);

export const Order = mongoose.model<OrderDoc>('Order', orderSchema);
