import type { ConfirmChannel } from 'amqplib';

import {
  EXCHANGE,
  EXCHANGE_TYPE,
  EventName,
  logger,
  NotFoundError,
  RabbitMQManager,
} from '@vortex/common';

import { config } from '../config/config';
import { Product } from '../models/Product';
import { IProduct } from '../types/product.interface';

const rabbitMQ = RabbitMQManager.getConnection(config.RABBITMQ_URL);

async function publishEvent(eventName: EventName, product: IProduct) {
  try {
    const channelWrapper = rabbitMQ.createChannel({
      json: true,
      setup: async (channel: ConfirmChannel) => {
        await channel.assertExchange(EXCHANGE, EXCHANGE_TYPE, {
          durable: true,
        });
      },
    });

    await channelWrapper.publish(EXCHANGE, eventName, {
      event: eventName,
      timestamp: new Date(),
      data: {
        productId: String(product._id),
        name: product.name,
        price: product.price,
        stock: product.stock,
        category: product.category,
        sellerId: product.sellerId ?? null,
      },
    });

    logger.info(`📤 Published ${eventName} event`);
  } catch (error) {
    logger.error(`Failed to publish ${eventName}:`, error);
  }
}

async function createProduct(
  data: Partial<IProduct>,
  actor?: { userId: string; role: string },
) {
  const { name, description, price, stock, category, sellerId } = data;
  const resolvedSellerId: string | undefined =
    actor?.role === 'seller' ? actor.userId : (sellerId ?? undefined);
  const product = await Product.create({
    name,
    description: description ?? '',
    price,
    stock,
    category: category ?? '',
    ...(resolvedSellerId && { sellerId: resolvedSellerId }),
  });
  await publishEvent(EventName.PRODUCT_CREATED, product);
  return product;
}

async function updateProduct(
  id: string,
  data: Partial<IProduct>,
  actor?: { userId: string; role: string },
) {
  const product = await Product.findById(id);
  if (!product) {
    throw new NotFoundError('Product not found');
  }
  if (actor?.role === 'seller' && product.sellerId !== actor.userId) {
    throw new NotFoundError('Product not found');
  }
  const updateData = { ...data };
  if (actor?.role === 'seller') {
    delete (updateData as Record<string, unknown>).sellerId;
  }
  const updated = await Product.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true },
  );
  if (!updated) throw new NotFoundError('Product not found');
  await publishEvent(EventName.PRODUCT_UPDATED, updated);
  return updated;
}

async function deleteProduct(
  id: string,
  actor?: { userId: string; role: string },
) {
  const product = await Product.findById(id);
  if (!product) {
    throw new NotFoundError('Product not found');
  }
  if (actor?.role === 'seller' && product.sellerId !== actor.userId) {
    throw new NotFoundError('Product not found');
  }
  await Product.findByIdAndDelete(id);
  await publishEvent(EventName.PRODUCT_DELETED, product);
  return { message: 'Product deleted successfully' };
}

async function getProducts(
  query: Record<string, unknown>,
  actor?: { userId: string; role: string },
) {
  const { q, category, minPrice, maxPrice, sortBy, sortOrder, skip, limit } =
    query;
  const dbQuery: Record<string, unknown> = {};

  if (actor?.role === 'seller') {
    dbQuery.sellerId = actor.userId;
  }

  const qStr = typeof q === 'string' ? q : '';
  if (qStr.trim()) {
    const { buildSearchOr } = await import('@vortex/common');
    const searchOr = buildSearchOr(['name', 'description', 'category'], qStr);
    if (searchOr) {
      Object.assign(dbQuery, searchOr);
    }
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

  const sortByStr = typeof sortBy === 'string' ? sortBy : '';
  const sortField =
    sortByStr && ['name', 'price', 'createdAt', 'stock'].includes(sortByStr)
      ? sortByStr
      : 'createdAt';
  const sortDir = sortOrder === 'asc' ? 1 : -1;

  const skipNum = Number(skip) || 0;
  const limitNum = Math.min(1000, Math.max(1, Number(limit) || 20));

  const [products, total] = await Promise.all([
    Product.find(dbQuery)
      .select('-__v')
      .sort({ [sortField]: sortDir } as Record<string, 1 | -1>)
      .skip(skipNum)
      .limit(limitNum)
      .lean(),
    Product.countDocuments(dbQuery),
  ]);

  return { products, total };
}

async function getProductById(id: string) {
  const product = await Product.findById(id);
  if (!product) {
    throw new NotFoundError('Product not found');
  }
  return product;
}

export const productService = {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProductById,
};
