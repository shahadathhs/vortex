/**
 * Notification types that support realtime delivery (email + socket).
 * All notifications are stored; these control what gets pushed in realtime.
 */
export const REALTIME_NOTIFICATION_TYPES = [
  'order.created',
  'order.updated',
  'user.created',
  'product.low_stock',
  'product.out_of_stock',
] as const;

export type RealtimeNotificationType =
  (typeof REALTIME_NOTIFICATION_TYPES)[number];

export type DeliveryChannel = 'email' | 'socket';
