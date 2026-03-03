import { Notification } from '../models/Notification';

export async function storeNotification(
  type: string,
  payload: Record<string, unknown>,
  options: {
    recipientId?: string | null;
    recipientRole?: 'system' | 'seller' | 'buyer';
  } = {},
): Promise<void> {
  await Notification.create({
    type,
    payload,
    recipientId: options.recipientId ?? null,
    recipientRole: options.recipientRole,
    read: false,
  });
}
