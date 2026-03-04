import { Document } from 'mongoose';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export interface IOrderItem {
  productId: string;
  quantity: number;
  price: number;
  sellerId?: string;
}

export interface IOrder extends Document {
  userId: string;
  userEmail?: string;
  items: IOrderItem[];
  totalPrice: number;
  status: OrderStatus;
}
