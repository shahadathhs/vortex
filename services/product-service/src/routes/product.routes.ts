import { validateRequest } from '@vortex/common';
import { Router } from 'express';

import { productController } from '../controllers/product.controller';
import {
  createProductSchema,
  getProductsSchema,
  updateProductSchema,
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
router.put(
  '/:id',
  validateRequest(updateProductSchema),
  productController.updateProduct,
);
router.delete('/:id', productController.deleteProduct);

export default router;
