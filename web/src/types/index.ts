export type Role = 'system' | 'seller' | 'buyer';

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
  isEmailVerified: boolean;
  stripeAccountId?: string;
  stripeOnboardingComplete?: boolean;
  tfaEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  level: number;
  path: string[];
  image?: {
    url: string;
    alt: string;
  };
  isActive: boolean;
  displayOrder: number;
  productCount: number;
}

export interface Brand {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  isActive: boolean;
  displayOrder: number;
  productCount: number;
}

export interface ProductImage {
  url: string;
  alt: string;
  isPrimary?: boolean;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  category: string;
  categoryIds?: string[];
  primaryCategoryId?: string;
  sellerId: string;
  images: ProductImage[];
  rating?: number;
  reviewCount?: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  sellerId?: string;
}

export interface Order {
  _id: string;
  userId: string;
  userEmail?: string;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  type: string;
  recipientId?: string;
  recipientRole?: Role;
  payload: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

export interface NotificationSettings {
  userId: string;
  emailTypes: string[];
  socketTypes: string[];
}

export interface PaymentSettings {
  paymentEnabled: boolean;
  platformFeePercent: number;
  automaticPayoutsEnabled: boolean;
  payoutDayOfMonth: number;
}

export interface Transaction {
  _id: string;
  orderId: string;
  sellerId: string;
  amountCents: number;
  platformFeeCents: number;
  sellerAmountCents: number;
  status: 'PENDING' | 'TRANSFERRED' | 'FAILED';
  stripeTransferId?: string;
  failureReason?: string;
  transferredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  _id: string;
  actorId: string;
  actorRole: string;
  actorEmail?: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  timestamp: string;
}

export interface AnalyticsDashboard {
  totalOrders?: number;
  totalRevenue?: number;
  totalProducts?: number;
  recentOrders?: Order[];
  [key: string]: unknown;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  message: string;
  statusCode?: number;
}
