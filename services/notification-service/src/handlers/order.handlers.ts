import { logger } from '@vortex/common';

import { sendEmail } from '../lib/email';

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

  logger.info(
    `[Order Confirmation] Order ${orderId} by user ${userId}. Total: $${totalPrice}`,
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

  if (userEmail && ['shipped', 'delivered'].includes(status)) {
    await sendEmail(
      userEmail,
      `Order #${orderId} - ${status}`,
      `<h1>Order ${status}</h1><p>Your order #${orderId} is now ${status}.</p>`,
    );
  }
}
