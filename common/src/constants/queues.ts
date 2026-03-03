export enum QueueName {
  NOTIFICATION_QUEUE = 'notification_queue',
  INVENTORY_QUEUE = 'inventory_queue',
}

export const EXCHANGE = 'vortex';
export const EXCHANGE_TYPE = 'topic';

export const RoutingKey = {
  // Subscribe to every event on the exchange
  ALL_EVENTS: '#',

  // Subscribe to all events by domain
  ALL_USER_EVENTS: 'user.#',
  ALL_PRODUCT_EVENTS: 'product.#',
  ALL_ORDER_EVENTS: 'order.#',
  ALL_PAYMENT_EVENTS: 'payment.#',
} as const;
