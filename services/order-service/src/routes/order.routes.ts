import { protect, requireUser, validateRequest } from '@vortex/common';
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
  orderController.createOrder,
);
router.get(
  '/',
  ...auth,
  validateRequest(getOrdersQuerySchema),
  orderController.getOrders,
);
router.get(
  '/user/:userId',
  ...auth,
  validateRequest(userIdParamSchema),
  orderController.getOrdersByUser,
);
router.get(
  '/:id',
  ...auth,
  validateRequest(orderIdParamSchema),
  orderController.getOrderById,
);
router.put(
  '/:id/status',
  ...auth,
  validateRequest(updateOrderStatusSchema),
  orderController.updateOrderStatus,
);

export default router;
