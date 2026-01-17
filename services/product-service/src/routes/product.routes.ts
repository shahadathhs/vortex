import { validateRequest } from '@vortex/common';
import { Router } from 'express';

import { productController } from '../controllers/product.controller';
import {
  createProductSchema,
  getProductsSchema,
} from '../schemas/product.schema';

const router: Router = Router();

router.post(
  '/',
  validateRequest(createProductSchema),
  productController.createProduct,
);
router.get(
  '/',
  validateRequest(getProductsSchema),
  productController.getProducts,
);
router.get('/:id', productController.getProductById);

export default router;
