export enum ServicePort {
  GATEWAY = 3000,
  AUTH = 3001,
  PRODUCT = 3002,
  ORDER = 3003,
  NOTIFICATION = 3004,
}

export enum EventName {
  ORDER_CREATED = 'order.created',
  PRODUCT_CREATED = 'product.created',
  PRODUCT_UPDATED = 'product.updated',
}

export enum QueueName {
  NOTIFICATION_QUEUE = 'notification_queue',
  ORDER_QUEUE = 'order_queue',
}
