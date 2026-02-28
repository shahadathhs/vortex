import { protect, requireUser, validateRequest } from '@vortex/common';
import { Router } from 'express';

import { config } from '../config/config';
import { cartController } from '../controllers/cart.controller';
import {
  addCartItemSchema,
  removeCartItemSchema,
  updateCartItemSchema,
} from '../schemas/cart.schema';

const router: Router = Router();

router.use(protect(config.JWT_SECRET), requireUser);

router.get('/', cartController.getCart);
router.post('/', validateRequest(addCartItemSchema), cartController.addItem);
router.put(
  '/:productId',
  validateRequest(updateCartItemSchema),
  cartController.updateItem,
);
router.delete(
  '/:productId',
  validateRequest(removeCartItemSchema),
  cartController.removeItem,
);
router.post('/clear', cartController.clearCart);

export default router;
