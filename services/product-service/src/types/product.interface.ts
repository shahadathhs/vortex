import { Types } from 'mongoose';

export interface IProductImage {
  _id?: string;
  url: string;
  alt: string;
  position: number;
  isPrimary: boolean;
  width: number;
  height: number;
}

export interface IVariantOption {
  name: string;
  value: string;
}

export interface IVariant {
  _id?: string;
  name: string;
  sku: string;
  price?: number;
  compareAtPrice?: number;
  stock: number;
  weight?: number;
  options: IVariantOption[];
  image?: IProductImage;
  isDefault: boolean;
}

export interface IProductAttribute {
  name: string;
  value: string | string[];
  visible: boolean;
}

export interface IB2BPricingTier {
  minQuantity: number;
  discountPercent: number;
  price?: number;
}

export interface IB2BPricing {
  enabled: boolean;
  tiers: IB2BPricingTier[];
}

export interface IProduct {
  _id: Types.ObjectId;
  // Basic Info
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;

  // Seller Info
  sellerId: string;
  storeId?: string;

  // Pricing
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  currency: string;

  // Inventory
  stock: number;
  lowStockThreshold?: number;
  allowBackorder: boolean;
  trackInventory: boolean;

  // Product Status
  status: 'draft' | 'active' | 'archived' | 'out_of_stock';
  publishedAt?: Date;

  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];

  // Media
  images: IProductImage[];
  videos?: { url: string; thumbnail: string; position: number }[];

  // Categories & Organization
  categoryIds: string[];
  primaryCategoryId: string;
  tags: string[];
  brandId?: string;

  // Variants
  hasVariants: boolean;
  variantType: 'none' | 'size' | 'color' | 'size_color' | 'custom';
  variants?: IVariant[];

  // Attributes
  attributes: IProductAttribute[];

  // Shipping
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  requiresShipping: boolean;
  freeShipping: boolean;

  // Taxes
  taxClassId?: string;
  taxable: boolean;

  // Reviews & Ratings
  rating: number;
  reviewCount: number;

  // Analytics
  viewCount: number;
  purchaseCount: number;
  wishlistCount: number;

  // B2B Pricing
  b2bPricing?: IB2BPricing;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;

  // Virtual property for backward compatibility
  category?: string;
}

export interface ICreateProductInput {
  name: string;
  slug?: string;
  description: string;
  shortDescription?: string;
  sellerId: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  category?: string;
  categoryIds?: string[];
  primaryCategoryId?: string;
  tags?: string[];
  brandId?: string;
  images?: IProductImage[];
  variants?: IVariant[];
  hasVariants?: boolean;
  variantType?: 'none' | 'size' | 'color' | 'size_color' | 'custom';
  attributes?: IProductAttribute[];
  status?: 'draft' | 'active' | 'archived' | 'out_of_stock';
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  allowBackorder?: boolean;
  trackInventory?: boolean;
  lowStockThreshold?: number;
  weight?: number;
  requiresShipping?: boolean;
  freeShipping?: boolean;
  taxable?: boolean;
  b2bPricing?: IB2BPricing;
}

export interface IUpdateProductInput extends Partial<ICreateProductInput> {
  id: string;
}

export interface IProductFilter {
  search?: string;
  category?: string;
  brand?: string;
  sellerId?: string;
  status?: 'draft' | 'active' | 'archived' | 'out_of_stock';
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  tags?: string[];
  hasVariants?: boolean;
  inStock?: boolean;
  page?: number;
  limit?: number;
  sort?: 'createdAt' | 'price' | 'rating' | 'name' | 'popularity';
  order?: 'asc' | 'desc';
}
