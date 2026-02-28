import { Document } from 'mongoose';

export interface ICartItem {
  productId: string;
  quantity: number;
}

export interface ICart extends Document {
  userId: string;
  items: ICartItem[];
}
