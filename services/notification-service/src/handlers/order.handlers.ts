import { logger } from '@vortex/common';

import { sendEmail } from '../lib/email';
import { storeNotification } from '../lib/store-notification';

function safeStr(v: unknown): string {
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  return '';
}

export async function handleOrderCreated(data: Record<string, unknown>) {
  const orderId = safeStr(data.orderId);
  const userId = safeStr(data.userId);
  const totalPrice = safeStr(data.totalPrice);
  const userEmail = safeStr(data.userEmail);
  const items = (data.items as { productId: string; quantity: number }[]) ?? [];

  logger.info(
    `[Order Confirmation] Order ${orderId} by user ${userId}. Total: $${totalPrice}`,
  );

  await storeNotification(
    'order.created',
    {
      orderId,
      userId,
      totalPrice,
      userEmail,
      items,
      message: `Order #${orderId} placed. Total: $${totalPrice}`,
    },
    { recipientId: userId, recipientRole: 'buyer' },
  );

  await storeNotification(
    'order.created',
    {
      orderId,
      userId,
      totalPrice,
      userEmail,
      items,
      message: `New order #${orderId} from ${userEmail}. Total: $${totalPrice}`,
    },
    { recipientRole: 'system' },
  );

  if (userEmail) {
    await sendEmail(
      userEmail,
      `Order Confirmation #${orderId}`,
      `<h1>Order Confirmed</h1><p>Order #${orderId} placed successfully. Total: $${totalPrice}</p>`,
    );
  }
}

export async function handleOrderUpdated(data: Record<string, unknown>) {
  const orderId = safeStr(data.orderId);
  const userId = safeStr(data.userId);
  const status = safeStr(data.status);
  const userEmail = safeStr(data.userEmail);

  logger.info(
    `[Order Update] Order ${orderId} (user ${userId}) status: ${status}`,
  );

  await storeNotification(
    'order.updated',
    {
      orderId,
      userId,
      status,
      message: `Order #${orderId} is now ${status}`,
    },
    { recipientId: userId, recipientRole: 'buyer' },
  );

  await storeNotification(
    'order.updated',
    {
      orderId,
      userId,
      status,
      userEmail,
      message: `Order #${orderId} status: ${status}`,
    },
    { recipientRole: 'system' },
  );

  if (userEmail && ['shipped', 'delivered'].includes(status)) {
    await sendEmail(
      userEmail,
      `Order #${orderId} - ${status}`,
      `<h1>Order ${status}</h1><p>Your order #${orderId} is now ${status}.</p>`,
    );
  }
}
