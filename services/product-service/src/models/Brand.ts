import { Schema, model } from 'mongoose';
import slugify from 'slugify';
import { IBrand } from '../types/brand.interface';

const brandSchema = new Schema<IBrand>(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    description: { type: String, trim: true },

    // Media
    logo: { type: String },
    banner: { type: String },

    // External Links
    website: { type: String },

    // SEO
    metaTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },

    // Settings
    isActive: { type: Boolean, default: true, required: true, index: true },
    displayOrder: { type: Number, default: 0 },

    // Products
    productCount: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Indexes
brandSchema.index({ slug: 1 }, { unique: true, sparse: true });
brandSchema.index({ isActive: 1, displayOrder: 1 });
brandSchema.index({ name: 'text' });

// Pre-save hook to generate slug
(brandSchema as any).pre(
  'save',
  async function (this: any, next: (err?: Error) => void) {
    if (!this.slug && this.name) {
      this.slug = slugify(this.name, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g,
      });

      // Ensure uniqueness
      const existing = await this.constructor.findOne({ slug: this.slug });
      if (existing && existing._id.toString() !== this._id.toString()) {
        this.slug = `${this.slug}-${Math.random().toString(36).substring(2, 8)}`;
      }
    }

    // Auto-generate metaTitle if not set
    if (!this.metaTitle && this.name) {
      this.metaTitle = this.name;
    }

    // Auto-generate metaDescription if not set
    if (!this.metaDescription && this.description) {
      this.metaDescription = this.description.substring(0, 160);
    }

    next();
  },
);

// Static method to increment product count
brandSchema.statics.incrementProductCount = async function (
  brandId: string,
  amount = 1,
) {
  await this.findByIdAndUpdate(brandId, {
    $inc: { productCount: amount },
  });
};

// Static method to get active brands
brandSchema.statics.getActive = function () {
  return this.find({ isActive: true })
    .sort({ displayOrder: 1, name: 1 })
    .lean();
};

const BrandModel = model<IBrand>('Brand', brandSchema);

// Export with both direct access and .model property for consistency
export const Brand = Object.assign(BrandModel, {
  model: BrandModel,
});
