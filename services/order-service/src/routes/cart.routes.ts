import {
  asyncHandler,
  checkPermission,
  Permission,
  protect,
  requireUser,
  validateRequest,
} from '@vortex/common';
import { Router } from 'express';

import { config } from '../config/config';
import { cartController } from '../controllers/cart.controller';
import {
  addCartItemSchema,
  clearCartSchema,
  getCartSchema,
  removeCartItemSchema,
  updateCartItemSchema,
} from '../schemas/cart.schema';

const router: Router = Router();

router.use(protect(config.JWT_SECRET), requireUser);

router.get(
  '/',
  checkPermission(Permission.CART_READ),
  validateRequest(getCartSchema),
  asyncHandler(cartController.getCart),
);
router.post(
  '/',
  checkPermission(Permission.CART_ADD),
  validateRequest(addCartItemSchema),
  asyncHandler(cartController.addItem),
);
router.put(
  '/:productId',
  checkPermission(Permission.CART_UPDATE),
  validateRequest(updateCartItemSchema),
  asyncHandler(cartController.updateItem),
);
router.delete(
  '/:productId',
  checkPermission(Permission.CART_REMOVE),
  validateRequest(removeCartItemSchema),
  asyncHandler(cartController.removeItem),
);
router.post(
  '/clear',
  checkPermission(Permission.CART_CLEAR),
  validateRequest(clearCartSchema),
  asyncHandler(cartController.clearCart),
);

export default router;
