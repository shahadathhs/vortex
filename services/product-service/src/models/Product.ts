import mongoose from 'mongoose';

export interface ProductDoc extends mongoose.Document {
  name: string;
  description: string;
  price: number;
  stock: number;
}

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
  },
  {
    toJSON: {
      transform(doc, ret) {
        (ret as any).id = (ret as any)._id;
        delete (ret as any)._id;
        delete (ret as any).__v;
      },
    },
  },
);

// For text search logic requested by user earlier
productSchema.index({ name: 'text', description: 'text' });

export const Product = mongoose.model<ProductDoc>('Product', productSchema);
