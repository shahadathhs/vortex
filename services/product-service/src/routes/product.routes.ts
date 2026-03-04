import {
  asyncHandler,
  checkPermission,
  optionalProtect,
  Permission,
  protect,
  requireUser,
  validateRequest,
} from '@vortex/common';
import { Router } from 'express';

import { productController } from '../controllers/product.controller';
import { config } from '../config/config';
import {
  createProductSchema,
  getProductsSchema,
  productIdParamSchema,
  updateProductSchema,
} from '../schemas/product.schema';

const router: Router = Router();

const auth = [protect(config.JWT_SECRET), requireUser];

router.post(
  '/',
  ...auth,
  checkPermission(Permission.PRODUCT_CREATE),
  validateRequest(createProductSchema),
  asyncHandler(productController.createProduct),
);
router.get(
  '/',
  optionalProtect(config.JWT_SECRET),
  validateRequest(getProductsSchema),
  asyncHandler(productController.getProducts),
);
router.get('/:id', asyncHandler(productController.getProductById));
router.put(
  '/:id',
  ...auth,
  checkPermission(Permission.PRODUCT_UPDATE),
  validateRequest(updateProductSchema),
  asyncHandler(productController.updateProduct),
);
router.delete(
  '/:id',
  ...auth,
  checkPermission(Permission.PRODUCT_DELETE),
  validateRequest(productIdParamSchema),
  asyncHandler(productController.deleteProduct),
);

export default router;
