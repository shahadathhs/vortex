export enum Permission {
  // User permissions
  USER_READ = 'USER_READ',
  USER_UPDATE = 'USER_UPDATE',
  USER_DELETE = 'USER_DELETE',

  // Seller management (system only)
  SELLER_CREATE = 'SELLER_CREATE',
  SELLER_DELETE = 'SELLER_DELETE',
  SELLER_RESET_PASSWORD = 'SELLER_RESET_PASSWORD',
  SELLER_LIST = 'SELLER_LIST',

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

  // Analytics & activity (role-specific dashboards)
  ANALYTICS_SYSTEM = 'ANALYTICS_SYSTEM',
  ANALYTICS_SELLER = 'ANALYTICS_SELLER',
  ANALYTICS_BUYER = 'ANALYTICS_BUYER',
  ACTIVITY_VIEW_ALL = 'ACTIVITY_VIEW_ALL',
}

export enum Role {
  SYSTEM = 'system',
  SELLER = 'seller',
  BUYER = 'buyer',
}

export const RolePermissions: Record<Role, Permission[]> = {
  [Role.SYSTEM]: [
    ...Object.values(Permission),
    Permission.SELLER_CREATE,
    Permission.SELLER_DELETE,
    Permission.SELLER_RESET_PASSWORD,
    Permission.SELLER_LIST,
    Permission.ANALYTICS_SYSTEM,
    Permission.ACTIVITY_VIEW_ALL,
  ],
  [Role.SELLER]: [
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.PRODUCT_CREATE,
    Permission.PRODUCT_UPDATE,
    Permission.PRODUCT_DELETE,
    Permission.PRODUCT_READ,
    Permission.ORDER_VIEW_OWN,
    Permission.ANALYTICS_SELLER,
  ],
  [Role.BUYER]: [
    Permission.PRODUCT_READ,
    Permission.ORDER_CREATE,
    Permission.ORDER_VIEW_OWN,
    Permission.ANALYTICS_BUYER,
  ],
};
