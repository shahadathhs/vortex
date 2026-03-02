import {
  asyncHandler,
  protect,
  requireUser,
  validateRequest,
} from '@vortex/common';
import { Router } from 'express';

import { jwtSecret } from '../config/config';
import { orderController } from '../controllers/order.controller';
import {
  getOrdersQuerySchema,
  orderIdParamSchema,
  updateOrderStatusSchema,
  userIdParamSchema,
} from '../schemas/order.schema';

const auth = [protect(jwtSecret), requireUser];

const router: Router = Router();

router.get(
  '/',
  ...auth,
  validateRequest(getOrdersQuerySchema),
  asyncHandler(orderController.getOrders),
);
router.get(
  '/user/:userId',
  ...auth,
  validateRequest(userIdParamSchema),
  asyncHandler(orderController.getOrdersByUser),
);
router.get(
  '/:id',
  ...auth,
  validateRequest(orderIdParamSchema),
  asyncHandler(orderController.getOrderById),
);
router.put(
  '/:id/status',
  ...auth,
  validateRequest(updateOrderStatusSchema),
  asyncHandler(orderController.updateOrderStatus),
);

export default router;
