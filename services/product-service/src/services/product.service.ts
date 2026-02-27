import {
  ConfirmChannel,
  EventName,
  logger,
  NotFoundError,
  RabbitMQManager,
} from '@vortex/common';

import { config } from '../config/config';
import { Product } from '../models/Product';
import { IProduct } from '../types/product.interface';

export class ProductService {
  private rabbitMQ = RabbitMQManager.getConnection(config.RABBITMQ_URL);

  async createProduct(data: Partial<IProduct>) {
    const { name, description, price, stock, category } = data;
    const product = await Product.create({
      name,
      description: description ?? '',
      price,
      stock,
      category: category ?? '',
    });
    await this.publishEvent(EventName.PRODUCT_CREATED, product);
    return product;
  }

  async updateProduct(id: string, data: Partial<IProduct>) {
    const product = await Product.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true },
    );
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    await this.publishEvent(EventName.PRODUCT_UPDATED, product);
    return product;
  }

  async deleteProduct(id: string) {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    return { message: 'Product deleted successfully' };
  }

  async getProducts(query: Record<string, unknown>) {
    const { q, category, minPrice, maxPrice } = query;
    const dbQuery: Record<string, unknown> = {};

    if (q) {
      dbQuery.$text = { $search: q as string };
    }
    if (category) {
      dbQuery.category = category;
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      dbQuery.price = {};
      if (minPrice !== undefined) {
        (dbQuery.price as Record<string, number>).$gte = Number(minPrice);
      }
      if (maxPrice !== undefined) {
        (dbQuery.price as Record<string, number>).$lte = Number(maxPrice);
      }
    }

    const products = await Product.find(dbQuery);
    return products;
  }

  async getProductById(id: string) {
    const product = await Product.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    return product;
  }

  private async publishEvent(eventName: EventName, product: IProduct) {
    try {
      const channelWrapper = this.rabbitMQ.createChannel({
        json: true,
        setup: async (channel: ConfirmChannel) => {
          await channel.assertExchange('vortex', 'topic', { durable: true });
        },
      });

      await channelWrapper.publish('vortex', eventName, {
        eventName,
        timestamp: new Date(),
        data: {
          productId: String(product._id),
          name: product.name,
          price: product.price,
          stock: product.stock,
          category: product.category,
        },
      });

      logger.info(`📤 Published ${eventName} event`);
    } catch (error) {
      logger.error(`Failed to publish ${eventName}:`, error);
    }
  }
}

export const productService = new ProductService();
