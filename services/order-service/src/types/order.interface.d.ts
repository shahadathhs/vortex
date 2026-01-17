import { Document } from 'mongoose';
export interface IOrder extends Document {
  userId: string;
  productId: string;
  quantity: number;
  totalPrice: number;
}
