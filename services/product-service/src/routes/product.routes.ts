import {
  asyncHandler,
  checkPermission,
  Permission,
  protect,
  validateRequest,
} from '@vortex/common';
import { Router } from 'express';

import { productController } from '../controllers/product.controller';
import { jwtSecret } from '../config/config';
import {
  createProductSchema,
  getProductsSchema,
  productIdParamSchema,
  updateProductSchema,
} from '../schemas/product.schema';

const router: Router = Router();

router.post(
  '/',
  protect(jwtSecret),
  checkPermission(Permission.PRODUCT_CREATE),
  validateRequest(createProductSchema),
  asyncHandler(productController.createProduct),
);
router.get(
  '/',
  validateRequest(getProductsSchema),
  asyncHandler(productController.getProducts),
);
router.get('/:id', asyncHandler(productController.getProductById));
router.put(
  '/:id',
  protect(jwtSecret),
  checkPermission(Permission.PRODUCT_UPDATE),
  validateRequest(updateProductSchema),
  asyncHandler(productController.updateProduct),
);
router.delete(
  '/:id',
  protect(jwtSecret),
  checkPermission(Permission.PRODUCT_DELETE),
  validateRequest(productIdParamSchema),
  asyncHandler(productController.deleteProduct),
);

export default router;
