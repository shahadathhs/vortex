import {
  asyncHandler,
  protect,
  requireUser,
  validateRequest,
} from '@vortex/common';
import { Router } from 'express';

import { jwtSecret } from '../config/config';
import { cartController } from '../controllers/cart.controller';
import {
  addCartItemSchema,
  removeCartItemSchema,
  updateCartItemSchema,
} from '../schemas/cart.schema';

const router: Router = Router();

router.use(protect(jwtSecret), requireUser);

router.get('/', asyncHandler(cartController.getCart));
router.post(
  '/',
  validateRequest(addCartItemSchema),
  asyncHandler(cartController.addItem),
);
router.put(
  '/:productId',
  validateRequest(updateCartItemSchema),
  asyncHandler(cartController.updateItem),
);
router.delete(
  '/:productId',
  validateRequest(removeCartItemSchema),
  asyncHandler(cartController.removeItem),
);
router.post('/clear', asyncHandler(cartController.clearCart));

export default router;
