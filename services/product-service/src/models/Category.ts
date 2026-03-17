import { Schema, model } from 'mongoose';
import slugify from 'slugify';
import { ICategory } from '../types/category.interface';

const categoryImageSchema = new Schema(
  {
    url: { type: String, required: true },
    alt: { type: String, required: true },
    width: { type: Number },
    height: { type: Number },
  },
  { _id: false },
);

const categorySchema = new Schema<ICategory>(
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

    // Hierarchy
    parentId: { type: String, index: true },
    level: { type: Number, default: 0, required: true },
    path: [{ type: String, index: true }],

    // Display
    image: categoryImageSchema,
    icon: { type: String },
    color: { type: String },

    // SEO
    metaTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },

    // Settings
    isActive: { type: Boolean, default: true, required: true, index: true },
    displayOrder: { type: Number, default: 0 },
    showInNavbar: { type: Boolean, default: false },

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
categorySchema.index({ parentId: 1, displayOrder: 1 });
categorySchema.index({ slug: 1 }, { unique: true, sparse: true });
categorySchema.index({ path: 1 });
categorySchema.index({ isActive: 1, displayOrder: 1 });
categorySchema.index({ name: 'text' });

// Pre-save hook to generate slug and manage hierarchy
(categorySchema as any).pre(
  'save',
  async function (this: any, next: (err?: Error) => void) {
    // Generate slug from name if not provided
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

    // Manage hierarchy and path
    if (this.parentId) {
      // If parentId is set, find parent and build path
      const parent = await this.constructor.findOne({ _id: this.parentId });
      if (parent) {
        this.level = (parent.level ?? 0) + 1;
        this.path = [...(parent.path ?? []), parent._id.toString()];
      } else {
        this.level = 0;
        this.path = [];
      }
    } else {
      // Root level category
      this.level = 0;
      this.path = [];
    }

    next();
  },
);

// Static method to get category tree
categorySchema.statics.getTree = async function (
  parentId: string | null = null,
): Promise<any[]> {
  const categories = await this.find({
    ...(parentId ? { parentId } : { parentId: { $exists: false } }),
    isActive: true,
  })
    .populate('parentId')
    .sort({ displayOrder: 1, name: 1 })
    .lean();

  const tree = await Promise.all(
    categories.map(async (cat: any) => ({
      ...(cat as Record<string, any>),
      children: await (this as any).getTree(cat._id.toString()),
    })),
  );

  return tree;
};

// Static method to get all descendants
categorySchema.statics.getDescendants = async function (
  categoryId: string,
): Promise<any[]> {
  const descendants = await this.find({
    path: categoryId,
    isActive: true,
  })
    .sort({ level: 1, displayOrder: 1 })
    .lean();

  return descendants;
};

// Static method to get breadcrumb path
categorySchema.statics.getBreadcrumb = async function (categoryId: string) {
  const category = await this.findById(categoryId);
  if (!category) return [];

  const categoryIds = [...(category.path ?? []), category._id.toString()];

  const categories = await this.find({
    _id: { $in: categoryIds },
  })
    .sort({ level: 1 })
    .lean();

  return categories;
};

// Static method to increment product count
categorySchema.statics.incrementProductCount = async function (
  categoryId: string,
  amount = 1,
) {
  await this.findByIdAndUpdate(categoryId, {
    $inc: { productCount: amount },
  });
};

const CategoryModel = model<ICategory>('Category', categorySchema);

// Export with both direct access and .model property for consistency
export const Category = Object.assign(CategoryModel, {
  model: CategoryModel,
});
