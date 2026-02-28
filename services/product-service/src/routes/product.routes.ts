import {
  checkPermission,
  Permission,
  protect,
  validateRequest,
} from '@vortex/common';
import { Router } from 'express';

import { config } from '../config/config';
import { productController } from '../controllers/product.controller';
import {
  createProductSchema,
  getProductsSchema,
  productIdParamSchema,
  updateProductSchema,
} from '../schemas/product.schema';

const router: Router = Router();

router.post(
  '/',
  protect(config.JWT_SECRET),
  checkPermission(Permission.PRODUCT_CREATE),
  validateRequest(createProductSchema),
  productController.createProduct,
);
router.get(
  '/',
  validateRequest(getProductsSchema),
  productController.getProducts,
);
router.get('/:id', productController.getProductById);
router.put(
  '/:id',
  protect(config.JWT_SECRET),
  checkPermission(Permission.PRODUCT_UPDATE),
  validateRequest(updateProductSchema),
  productController.updateProduct,
);
router.delete(
  '/:id',
  protect(config.JWT_SECRET),
  checkPermission(Permission.PRODUCT_DELETE),
  validateRequest(productIdParamSchema),
  productController.deleteProduct,
);

export default router;
