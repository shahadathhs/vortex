import {
  HttpStatusCode,
  getPagination,
  successResponse,
  successPaginatedResponse,
} from '@vortex/common';
import { Request, Response } from 'express';
import { Product, Category, Brand } from '../models/index';
import { IProductFilter } from '../types/product.interface';

/**
 * Public Product Controllers
 * These endpoints do not require authentication
 */

async function getPublicProducts(req: Request, res: Response) {
  const { page, limit, skip } = getPagination(req.query);

  // Build filter
  const filter: IProductFilter = {
    search: req.query.search as string,
    category: req.query.category as string,
    brand: req.query.brand as string,
    sellerId: req.query.sellerId as string,
    status: (req.query.status as 'active') || 'active',
    minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
    maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
    minRating: req.query.minRating ? Number(req.query.minRating) : undefined,
    tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
    hasVariants: req.query.hasVariants === 'true' ? true : undefined,
    inStock: req.query.inStock === 'true' ? true : undefined,
    page,
    limit,
    sort: (req.query.sort as string) ?? 'createdAt',
    order: (req.query.order as string) ?? 'desc',
  };

  // Build query
  const query: any = {
    status: 'active',
    deletedAt: null,
  };

  // Search
  if (filter.search) {
    query.$text = { $search: filter.search };
  }

  // Category filter
  if (filter.category) {
    const category = await Category.model.findOne({ slug: filter.category });
    if (category) {
      // Get all descendant categories
      const descendants = await (Category as any).getDescendants(
        category._id.toString(),
      );
      const categoryIds = [
        category._id.toString(),
        ...descendants.map((c: any) => c._id.toString() as string),
      ];
      query.categoryIds = { $in: categoryIds };
    }
  }

  // Brand filter
  if (filter.brand) {
    const brand = await Brand.model.findOne({ slug: filter.brand });
    if (brand) {
      query.brandId = brand._id.toString();
    }
  }

  // Seller filter
  if (filter.sellerId) {
    query.sellerId = filter.sellerId;
  }

  // Price range
  if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
    query.price = {};
    if (filter.minPrice !== undefined) query.price.$gte = filter.minPrice;
    if (filter.maxPrice !== undefined) query.price.$lte = filter.maxPrice;
  }

  // Rating filter
  if (filter.minRating !== undefined) {
    query.rating = { $gte: filter.minRating };
  }

  // Tags filter
  if (filter.tags && filter.tags.length > 0) {
    query.tags = { $in: filter.tags };
  }

  // Variants filter
  if (filter.hasVariants !== undefined) {
    query.hasVariants = filter.hasVariants;
  }

  // Stock filter
  if (filter.inStock) {
    query.$or = [{ stock: { $gt: 0 } }, { allowBackorder: true }];
  }

  // Sort
  let sortOption: any = {};
  switch (filter.sort) {
    case 'price':
      sortOption = { price: filter.order === 'asc' ? 1 : -1 };
      break;
    case 'rating':
      sortOption = { rating: filter.order === 'asc' ? 1 : -1 };
      break;
    case 'name':
      sortOption = { name: filter.order === 'asc' ? 1 : -1 };
      break;
    case 'popularity':
      sortOption = { viewCount: -1, purchaseCount: -1 };
      break;
    case 'createdAt':
    default:
      sortOption = { createdAt: filter.order === 'asc' ? 1 : -1 };
      break;
  }

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('brandId')
      .populate('primaryCategoryId')
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(query),
  ]);

  res.json(
    successPaginatedResponse(
      products,
      { page, limit, total },
      'Products retrieved successfully',
    ),
  );
}

async function getPublicProductBySlug(req: Request, res: Response) {
  const { slug } = req.params;

  const product = await Product.findOne({ slug, deletedAt: null })
    .populate('brandId')
    .populate('primaryCategoryId')
    .populate('categoryIds')
    .lean();

  if (!product) {
    return res
      .status(HttpStatusCode.NOT_FOUND)
      .json({ message: 'Product not found' });
  }

  // Increment view count
  await Product.findByIdAndUpdate(product._id, { $inc: { viewCount: 1 } });

  res.json(successResponse(product, 'Product retrieved successfully'));
}

async function getPublicCategories(req: Request, res: Response) {
  const categories = await Category.find({ isActive: true })
    .populate('parentId')
    .sort({ displayOrder: 1, name: 1 })
    .lean();

  res.json(successResponse(categories, 'Categories retrieved successfully'));
}

async function getPublicCategoryBySlug(req: Request, res: Response) {
  const { slug } = req.params;

  const category = await Category.model
    .findOne({ slug, isActive: true })
    .populate('parentId')
    .lean();

  if (!category) {
    return res
      .status(HttpStatusCode.NOT_FOUND)
      .json({ message: 'Category not found' });
  }

  res.json(successResponse(category, 'Category retrieved successfully'));
}

async function getPublicBrands(req: Request, res: Response) {
  const brands = await Brand.model
    .find({ isActive: true })
    .sort({ displayOrder: 1, name: 1 })
    .lean();

  res.json(successResponse(brands, 'Brands retrieved successfully'));
}

async function getPublicBrandBySlug(req: Request, res: Response) {
  const { slug } = req.params;

  const brand = await Brand.model.findOne({ slug, isActive: true }).lean();

  if (!brand) {
    return res
      .status(HttpStatusCode.NOT_FOUND)
      .json({ message: 'Brand not found' });
  }

  res.json(successResponse(brand, 'Brand retrieved successfully'));
}

async function getRelatedProducts(req: Request, res: Response) {
  const { id } = req.params;
  const limit = Number(req.query.limit) || 8;

  const product = await Product.findById(id);
  if (!product) {
    return res
      .status(HttpStatusCode.NOT_FOUND)
      .json({ message: 'Product not found' });
  }

  // Find related products based on:
  // 1. Same primary category
  // 2. Same tags
  // 3. Same brand
  const relatedProducts = await Product.find({
    _id: { $ne: product._id },
    status: 'active',
    deletedAt: null,
    $or: [
      { primaryCategoryId: product.primaryCategoryId },
      { tags: { $in: product.tags } },
      { brandId: product.brandId },
    ],
  })
    .populate('brandId')
    .populate('primaryCategoryId')
    .limit(limit)
    .lean();

  res.json(successResponse(relatedProducts, 'Related products retrieved'));
}

async function searchProducts(req: Request, res: Response) {
  const { q } = req.query;
  const { page, limit, skip } = getPagination(req.query);

  if (!q || typeof q !== 'string') {
    return res
      .status(HttpStatusCode.BAD_REQUEST)
      .json({ message: 'Search query is required' });
  }

  const query = {
    $text: { $search: q },
    status: 'active',
    deletedAt: null,
  };

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('brandId')
      .populate('primaryCategoryId')
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(query),
  ]);

  res.json(
    successPaginatedResponse(
      products,
      { page, limit, total },
      'Search results retrieved',
    ),
  );
}

export const publicController = {
  getPublicProducts,
  getPublicProductBySlug,
  getPublicCategories,
  getPublicCategoryBySlug,
  getPublicBrands,
  getPublicBrandBySlug,
  getRelatedProducts,
  searchProducts,
};
