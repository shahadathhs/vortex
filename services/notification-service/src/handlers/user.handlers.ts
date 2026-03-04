import { logger } from '@vortex/common';

import {
  deliverEmailRealtime,
  deliverSocketRealtime,
} from '../lib/deliver-realtime';
import { storeNotification } from '../lib/store-notification';

function safeStr(v: unknown): string {
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  return '';
}

export async function handleUserCreated(data: Record<string, unknown>) {
  const userId = safeStr(data.userId);
  const email = safeStr(data.email);
  const firstName = safeStr(data.firstName);

  logger.info(`[Welcome Email] Sending to ${email} (${firstName})`);

  const buyerPayload = {
    userId,
    email,
    firstName,
    message: `Welcome, ${firstName}!`,
  };

  await storeNotification('user.created', buyerPayload, {
    recipientId: userId,
    recipientRole: 'buyer',
  });

  if (userId) {
    await deliverSocketRealtime(userId, 'user.created', buyerPayload);
  }
  if (userId && email) {
    await deliverEmailRealtime(
      userId,
      'user.created',
      email,
      'Welcome to Vortex',
      `<h1>Welcome, ${firstName}!</h1><p>Thanks for signing up. Start browsing our catalog.</p>`,
    );
  }

  await storeNotification(
    'user.created',
    {
      userId,
      email,
      firstName,
      message: `New user registered: ${email}`,
    },
    { recipientRole: 'system' },
  );
}
