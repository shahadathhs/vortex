import type { Channel, ConsumeMessage } from 'amqplib';

import {
  EXCHANGE,
  EXCHANGE_TYPE,
  EventName,
  logger,
  QueueName,
  RabbitMQManager,
  RoutingKey,
} from '@vortex/common';
import { config } from '../config/config';
import { Product } from '../models/Product';

const LOW_STOCK_THRESHOLD = Number(process.env.LOW_STOCK_THRESHOLD) || 5;

interface OrderItem {
  productId?: string;
  quantity?: number;
}

interface OrderPayload {
  event?: string;
  data?: { items?: OrderItem[]; status?: string };
}

function parseItems(data: Record<string, unknown>): OrderItem[] {
  const items = data.items;
  if (!Array.isArray(items)) return [];
  return items.map((i) => ({
    productId: typeof i?.productId === 'string' ? i.productId : '',
    quantity: typeof i?.quantity === 'number' ? i.quantity : 0,
  }));
}

async function publishInventoryAlert(
  productId: string,
  event: string,
  product: { name: string; stock: number; sellerId?: string },
) {
  try {
    const connection = RabbitMQManager.getConnection(config.RABBITMQ_URL);
    const channelWrapper = connection.createChannel({
      json: true,
      setup: async (ch: Channel) => {
        await ch.assertExchange(EXCHANGE, EXCHANGE_TYPE, { durable: true });
      },
    });
    await channelWrapper.publish(EXCHANGE, event, {
      event,
      timestamp: new Date(),
      data: {
        productId,
        name: product.name,
        stock: product.stock,
        sellerId: product.sellerId ?? null,
      },
    });
    logger.info(`Published ${event} for product ${productId}`);
  } catch (err) {
    logger.error(`Failed to publish ${event}:`, err);
  }
}

async function decrementStock(productId: string, quantity: number) {
  if (!productId || quantity <= 0) return;
  const result = await Product.findByIdAndUpdate(
    productId,
    { $inc: { stock: -quantity } },
    { new: true },
  );
  if (result) {
    logger.info(`Decremented stock for ${productId} by ${quantity}`);
    if (result.stock <= 0) {
      await publishInventoryAlert(
        productId,
        EventName.PRODUCT_OUT_OF_STOCK,
        result,
      );
    } else if (result.stock < LOW_STOCK_THRESHOLD) {
      await publishInventoryAlert(
        productId,
        EventName.PRODUCT_LOW_STOCK,
        result,
      );
    }
  } else {
    logger.warn(`Product ${productId} not found for stock decrement`);
  }
}

async function restoreStock(productId: string, quantity: number) {
  if (!productId || quantity <= 0) return;
  await Product.findByIdAndUpdate(productId, {
    $inc: { stock: quantity },
  });
  logger.info(`Restored stock for ${productId} by ${quantity}`);
}

function handleMessage(content: string) {
  const payload: OrderPayload = JSON.parse(content);
  const event = (payload.event ?? '') as EventName;
  const data = payload.data ?? {};

  switch (event) {
    case EventName.ORDER_CREATED: {
      const items = parseItems(data);
      for (const item of items) {
        if (item.productId && item.quantity) {
          void decrementStock(item.productId, item.quantity).catch((err) => {
            logger.error('Stock decrement failed:', err);
          });
        }
      }
      break;
    }
    case EventName.ORDER_UPDATED: {
      const status = String(data.status ?? '');
      if (status === 'cancelled') {
        const items = parseItems(data);
        for (const item of items) {
          if (item.productId && item.quantity) {
            void restoreStock(item.productId, item.quantity).catch((err) => {
              logger.error('Stock restore failed:', err);
            });
          }
        }
      }
      break;
    }
    default:
      break;
  }
}

export function startOrderConsumer() {
  const connection = RabbitMQManager.getConnection(config.RABBITMQ_URL);

  connection.createChannel({
    setup: async (channel: Channel) => {
      await channel.assertExchange(EXCHANGE, EXCHANGE_TYPE, { durable: true });
      await channel.assertQueue(QueueName.INVENTORY_QUEUE, { durable: true });
      await channel.bindQueue(
        QueueName.INVENTORY_QUEUE,
        EXCHANGE,
        RoutingKey.ALL_ORDER_EVENTS,
      );
      await channel.consume(
        QueueName.INVENTORY_QUEUE,
        (msg: ConsumeMessage | null) => {
          if (msg) {
            try {
              handleMessage(msg.content.toString());
            } catch (err) {
              logger.error('Order consumer error:', err);
            }
            channel.ack(msg);
          }
        },
      );
    },
  });

  logger.info(
    'Inventory consumer started (order.created → decrement, order.updated cancelled → restore)',
  );
}
