import {
  asyncHandler,
  protect,
  requireUser,
  validateRequest,
} from '@vortex/common';
import { Router } from 'express';

import { config } from '../config/config';
import { orderController } from '../controllers/order.controller';
import {
  createOrderSchema,
  getOrdersQuerySchema,
  orderIdParamSchema,
  updateOrderStatusSchema,
  userIdParamSchema,
} from '../schemas/order.schema';

const auth = [protect(config.JWT_SECRET), requireUser];

const router: Router = Router();

router.post(
  '/',
  ...auth,
  validateRequest(createOrderSchema),
  asyncHandler(orderController.createOrder),
);
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
