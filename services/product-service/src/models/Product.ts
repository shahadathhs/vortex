import { Schema, model } from 'mongoose';
import slugify from 'slugify';
import { IProduct } from '../types/product.interface';

const productImageSchema = new Schema(
  {
    url: { type: String, required: true },
    alt: { type: String, required: true },
    position: { type: Number, default: 0 },
    isPrimary: { type: Boolean, default: false },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
  },
  { _id: true },
);

const variantOptionSchema = new Schema(
  {
    name: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false },
);

const variantSchema = new Schema(
  {
    name: { type: String, required: true },
    sku: { type: String, required: true },
    price: { type: Number },
    compareAtPrice: { type: Number },
    stock: { type: Number, required: true, default: 0 },
    weight: { type: Number },
    options: [variantOptionSchema],
    image: productImageSchema,
    isDefault: { type: Boolean, default: false },
  },
  { _id: true },
);

const productAttributeSchema = new Schema(
  {
    name: { type: String, required: true },
    value: { type: Schema.Types.Mixed, required: true },
    visible: { type: Boolean, default: true },
  },
  { _id: false },
);

const b2bPricingTierSchema = new Schema(
  {
    minQuantity: { type: Number, required: true },
    discountPercent: { type: Number, required: true },
    price: { type: Number },
  },
  { _id: false },
);

const b2bPricingSchema = new Schema(
  {
    enabled: { type: Boolean, default: false },
    tiers: [b2bPricingTierSchema],
  },
  { _id: false },
);

const productSchema = new Schema<IProduct>(
  {
    // Basic Info
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    description: { type: String, required: true },
    shortDescription: { type: String, trim: true, maxlength: 160 },

    // Seller Info
    sellerId: { type: String, required: true, index: true },
    storeId: { type: String },

    // Pricing
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    costPrice: { type: Number, min: 0 },
    currency: { type: String, default: 'USD' },

    // Inventory
    stock: { type: Number, required: true, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 10, min: 0 },
    allowBackorder: { type: Boolean, default: false },
    trackInventory: { type: Boolean, default: true },

    // Product Status
    status: {
      type: String,
      enum: ['draft', 'active', 'archived', 'out_of_stock'],
      default: 'draft',
      required: true,
      index: true,
    },
    publishedAt: { type: Date },

    // SEO
    metaTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },
    metaKeywords: [{ type: String }],

    // Media
    images: [productImageSchema],
    videos: [
      {
        url: { type: String, required: true },
        thumbnail: { type: String, required: true },
        position: { type: Number, default: 0 },
      },
    ],

    // Categories & Organization
    categoryIds: [{ type: String, index: true }],
    primaryCategoryId: { type: String, index: true },
    tags: [{ type: String, index: true }],
    brandId: { type: String, index: true },

    // Variants
    hasVariants: { type: Boolean, default: false, index: true },
    variantType: {
      type: String,
      enum: ['none', 'size', 'color', 'size_color', 'custom'],
      default: 'none',
    },
    variants: [variantSchema],

    // Attributes
    attributes: [productAttributeSchema],

    // Shipping
    weight: { type: Number, min: 0 }, // grams
    length: { type: Number, min: 0 }, // cm
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 },
    requiresShipping: { type: Boolean, default: true },
    freeShipping: { type: Boolean, default: false },

    // Taxes
    taxClassId: { type: String },
    taxable: { type: Boolean, default: true },

    // Reviews & Ratings
    rating: { type: Number, default: 0, min: 0, max: 5, index: true },
    reviewCount: { type: Number, default: 0, min: 0 },

    // Analytics
    viewCount: { type: Number, default: 0, index: true },
    purchaseCount: { type: Number, default: 0, index: true },
    wishlistCount: { type: Number, default: 0 },

    // B2B Pricing
    b2bPricing: b2bPricingSchema,

    // Timestamps
    deletedAt: { type: Date, index: true },

    // Virtual for backward compatibility
    category: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.costPrice; // Hide seller's cost
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  },
);

// Indexes for search and filtering
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ sellerId: 1, status: 1, deletedAt: 1 });
productSchema.index({ status: 1, createdAt: -1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ viewCount: -1 });
productSchema.index({ purchaseCount: -1 });
productSchema.index({ brandId: 1, status: 1, deletedAt: 1 });

// Compound index for common queries
productSchema.index({ status: 1, deletedAt: 1, createdAt: -1 });
productSchema.index({ primaryCategoryId: 1, status: 1, deletedAt: 1 });

// Virtual for backward compatibility - get category from primaryCategoryId
productSchema.virtual('category').get(function () {
  return this.primaryCategoryId || undefined;
});

// Pre-save hook to generate slug from name
(productSchema as any).pre(
  'save',
  async function (this: any, next: (err?: Error) => void) {
    if (!this.slug && this.name) {
      this.slug = generateSlug(this.name);

      // Ensure uniqueness
      const existing = await this.constructor.findOne({ slug: this.slug });
      if (existing && existing._id.toString() !== this._id.toString()) {
        // Add random suffix if duplicate
        this.slug = `${this.slug}-${Math.random().toString(36).substring(2, 8)}`;
      }
    }

    // Auto-update shortDescription from description if not set
    if (!this.shortDescription && this.description) {
      this.shortDescription = this.description.substring(0, 157) + '...';
    }

    // Auto-generate metaTitle if not set
    if (!this.metaTitle && this.name) {
      this.metaTitle = this.name;
    }

    // Auto-generate metaDescription if not set
    if (!this.metaDescription && this.shortDescription) {
      this.metaDescription = this.shortDescription;
    }

    // Set publishedAt when status changes to active
    if (this.status === 'active' && !this.publishedAt) {
      this.publishedAt = new Date();
    }

    // Backward compatibility: migrate category to categoryIds/primaryCategoryId
    if (this.category && (!this.categoryIds || this.categoryIds.length === 0)) {
      this.categoryIds = [this.category];
      this.primaryCategoryId = this.category;
    }

    next();
  },
);

// Helper function to generate slug
function generateSlug(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
  });
}

// Method to increment view count
productSchema.methods.incrementViewCount = function () {
  this.viewCount += 1;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return this.save();
};

// Method to increment purchase count
productSchema.methods.incrementPurchaseCount = function (quantity = 1) {
  this.purchaseCount += quantity;
  if (this.trackInventory) {
    this.stock -= quantity;
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return this.save();
};

// Method to update rating
productSchema.methods.updateRating = function (
  averageRating: number,
  reviewCount: number,
) {
  this.rating = averageRating;
  this.reviewCount = reviewCount;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return this.save();
};

// Static method to find active products
productSchema.statics.findActive = function () {
  return this.find({ status: 'active', deletedAt: null });
};

// Static method to find by slug
productSchema.statics.findBySlug = function (slug: string) {
  return this.findOne({ slug, deletedAt: null });
};

const ProductModel = model<IProduct>('Product', productSchema);

// Export with both direct access and .model property for consistency
export const Product = Object.assign(ProductModel, {
  model: ProductModel,
});
