export enum EventName {
  // User
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',

  // Product
  PRODUCT_CREATED = 'product.created',
  PRODUCT_UPDATED = 'product.updated',
  PRODUCT_DELETED = 'product.deleted',

  // Order
  ORDER_CREATED = 'order.created',
  ORDER_UPDATED = 'order.updated',

  // Payment
  PAYMENT_SUCCEEDED = 'payment.succeeded',
  PAYMENT_FAILED = 'payment.failed',

  // Auth
  PASSWORD_RESET_REQUESTED = 'password.reset.requested',
  PASSWORD_RESET_COMPLETED = 'password.reset.completed',
  TFA_OTP_REQUESTED = 'tfa.otp.requested',

  // Activity & notifications
  ACTIVITY_LOGGED = 'activity.logged',
  NOTIFICATION_CREATED = 'notification.created',

  // Inventory
  PRODUCT_LOW_STOCK = 'product.low_stock',
  PRODUCT_OUT_OF_STOCK = 'product.out_of_stock',
}
