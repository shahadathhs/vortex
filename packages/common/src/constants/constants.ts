export enum EventName {
  ORDER_CREATED = 'order.created',
  PRODUCT_CREATED = 'product.created',
  PRODUCT_UPDATED = 'product.updated',
}

export enum QueueName {
  NOTIFICATION_QUEUE = 'notification_queue',
  ORDER_QUEUE = 'order_queue',
}

export enum AuthEnv {
  MONGODB_URI = 'MONGODB_URI',
  JWT_SECRET = 'JWT_SECRET',
  PORT = 'PORT',
  RABBITMQ_URL = 'RABBITMQ_URL',
}

export enum GatewayEnv {
  PORT = 'PORT',
  AUTH_SERVICE_URL = 'AUTH_SERVICE_URL',
  PRODUCT_SERVICE_URL = 'PRODUCT_SERVICE_URL',
  ORDER_SERVICE_URL = 'ORDER_SERVICE_URL',
  NOTIFICATION_SERVICE_URL = 'NOTIFICATION_SERVICE_URL',
}

export enum NotificationEnv {
  PORT = 'PORT',
  RABBITMQ_URL = 'RABBITMQ_URL',
}

export enum OrderEnv {
  MONGODB_URI = 'MONGODB_URI',
  PORT = 'PORT',
  RABBITMQ_URL = 'RABBITMQ_URL',
}

export enum ProductEnv {
  MONGODB_URI = 'MONGODB_URI',
  PORT = 'PORT',
  RABBITMQ_URL = 'RABBITMQ_URL',
}

export enum Permission {
  // User permissions
  USER_READ = 'USER_READ',
  USER_UPDATE = 'USER_UPDATE',
  USER_DELETE = 'USER_DELETE',

  // Product permissions
  PRODUCT_CREATE = 'PRODUCT_CREATE',
  PRODUCT_UPDATE = 'PRODUCT_UPDATE',
  PRODUCT_DELETE = 'PRODUCT_DELETE',
  PRODUCT_READ = 'PRODUCT_READ',

  // Order permissions
  ORDER_CREATE = 'ORDER_CREATE',
  ORDER_CANCEL = 'ORDER_CANCEL',
  ORDER_VIEW_OWN = 'ORDER_VIEW_OWN',
  ORDER_MANAGE_ALL = 'ORDER_MANAGE_ALL',
}

export enum Role {
  ADMIN = 'admin',
  VENDOR = 'vendor',
  CUSTOMER = 'customer',
}

export const RolePermissions: Record<Role, Permission[]> = {
  [Role.ADMIN]: Object.values(Permission),
  [Role.VENDOR]: [
    Permission.PRODUCT_CREATE,
    Permission.PRODUCT_UPDATE,
    Permission.PRODUCT_DELETE,
    Permission.PRODUCT_READ,
    Permission.ORDER_VIEW_OWN,
  ],
  [Role.CUSTOMER]: [
    Permission.PRODUCT_READ,
    Permission.ORDER_CREATE,
    Permission.ORDER_VIEW_OWN,
  ],
};
