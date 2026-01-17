import { AppError } from '@vortex/common';

import { Product } from '../models/Product';

export class ProductService {
  async createProduct(data: any) {
    const { name, description, price, stock } = data;
    const product = await Product.create({ name, description, price, stock });
    return product;
  }

  async getProducts(query: any) {
    const { q } = query;
    let dbQuery = {};

    if (q) {
      dbQuery = { $text: { $search: q as string } };
    }

    const products = await Product.find(dbQuery);
    return products;
  }

  async getProductById(id: string) {
    const product = await Product.findById(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    return product;
  }
}

export const productService = new ProductService();
