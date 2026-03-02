import {
  Channel,
  ConsumeMessage,
  logger,
  QueueName,
  RabbitMQManager,
} from '@vortex/common';
import { env } from '../config/config';
import { Product } from '../models/Product';

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

async function decrementStock(productId: string, quantity: number) {
  if (!productId || quantity <= 0) return;
  const result = await Product.findByIdAndUpdate(
    productId,
    { $inc: { stock: -quantity } },
    { new: true },
  );
  if (result) {
    logger.info(`Decremented stock for ${productId} by ${quantity}`);
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
  const event = String(payload.event ?? '');
  const data = payload.data ?? {};

  if (event === 'order.created') {
    const items = parseItems(data);
    for (const item of items) {
      if (item.productId && item.quantity) {
        decrementStock(item.productId, item.quantity).catch((err) =>
          logger.error('Stock decrement failed:', err),
        );
      }
    }
  } else if (event === 'order.updated') {
    const status = String(data.status ?? '');
    if (status === 'cancelled') {
      const items = parseItems(data);
      for (const item of items) {
        if (item.productId && item.quantity) {
          restoreStock(item.productId, item.quantity).catch((err) =>
            logger.error('Stock restore failed:', err),
          );
        }
      }
    }
  }
}

export function startOrderConsumer() {
  const connection = RabbitMQManager.getConnection(env.RABBITMQ_URL);

  connection.createChannel({
    setup: async (channel: Channel) => {
      await channel.assertExchange('vortex', 'topic', { durable: true });
      await channel.assertQueue(QueueName.INVENTORY_QUEUE, { durable: true });
      await channel.bindQueue(QueueName.INVENTORY_QUEUE, 'vortex', 'order.#');
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
