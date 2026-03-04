import { sendEmail } from './email';
import { emitToUser } from './socket';
import { shouldDeliverRealtime } from '../services/notification-settings.service';

export async function deliverEmailRealtime(
  userId: string,
  notificationType: string,
  to: string,
  subject: string,
  html: string,
): Promise<boolean> {
  const allowed = await shouldDeliverRealtime(
    userId,
    notificationType,
    'email',
  );
  if (!allowed) return false;
  return sendEmail(to, subject, html);
}

export async function deliverSocketRealtime(
  userId: string,
  notificationType: string,
  payload: Record<string, unknown>,
): Promise<void> {
  const allowed = await shouldDeliverRealtime(
    userId,
    notificationType,
    'socket',
  );
  if (!allowed) return;
  emitToUser(userId, 'notification', {
    type: notificationType,
    ...payload,
  });
}
