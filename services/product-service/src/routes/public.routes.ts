import { asyncHandler } from '@vortex/common';
import { Router } from 'express';
import { publicController } from '../controllers/public.controller';

const router: Router = Router();

/**
 * Public Routes - No Authentication Required
 * These endpoints allow guest users to browse products, categories, and brands
 */

// Products
router.get('/products', asyncHandler(publicController.getPublicProducts));
router.get(
  '/products/slug/:slug',
  asyncHandler(publicController.getPublicProductBySlug),
);
router.get(
  '/products/:id/related',
  asyncHandler(publicController.getRelatedProducts),
);

// Search
router.get('/search', asyncHandler(publicController.searchProducts));

// Categories
router.get('/categories', asyncHandler(publicController.getPublicCategories));
router.get(
  '/categories/slug/:slug',
  asyncHandler(publicController.getPublicCategoryBySlug),
);

// Brands
router.get('/brands', asyncHandler(publicController.getPublicBrands));
router.get(
  '/brands/slug/:slug',
  asyncHandler(publicController.getPublicBrandBySlug),
);

export default router;
