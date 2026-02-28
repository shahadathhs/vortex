export enum Permission {
  // User permissions
  USER_READ = 'USER_READ',
  USER_UPDATE = 'USER_UPDATE',
  USER_DELETE = 'USER_DELETE',

  // Admin management (superadmin only)
  ADMIN_CREATE = 'ADMIN_CREATE',
  ADMIN_DELETE = 'ADMIN_DELETE',
  ADMIN_RESET_PASSWORD = 'ADMIN_RESET_PASSWORD',
  ADMIN_LIST = 'ADMIN_LIST',

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
  SUPERADMIN = 'superadmin',
  ADMIN = 'admin',
  VENDOR = 'vendor',
  CUSTOMER = 'customer',
}

const superadminPermissions = [
  ...Object.values(Permission),
  Permission.ADMIN_CREATE,
  Permission.ADMIN_DELETE,
  Permission.ADMIN_RESET_PASSWORD,
  Permission.ADMIN_LIST,
];

export const RolePermissions: Record<Role, Permission[]> = {
  [Role.SUPERADMIN]: superadminPermissions,
  [Role.ADMIN]: Object.values(Permission).filter(
    (p) =>
      ![
        Permission.ADMIN_CREATE,
        Permission.ADMIN_DELETE,
        Permission.ADMIN_RESET_PASSWORD,
        Permission.ADMIN_LIST,
      ].includes(p),
  ),
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
