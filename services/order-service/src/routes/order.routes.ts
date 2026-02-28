import { protect, validateRequest } from '@vortex/common';
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

const router: Router = Router();

router.post(
  '/',
  protect(config.JWT_SECRET),
  validateRequest(createOrderSchema),
  orderController.createOrder,
);
router.get(
  '/',
  protect(config.JWT_SECRET),
  validateRequest(getOrdersQuerySchema),
  orderController.getOrders,
);
router.get(
  '/user/:userId',
  protect(config.JWT_SECRET),
  validateRequest(userIdParamSchema),
  orderController.getOrdersByUser,
);
router.get(
  '/:id',
  protect(config.JWT_SECRET),
  validateRequest(orderIdParamSchema),
  orderController.getOrderById,
);
router.put(
  '/:id/status',
  protect(config.JWT_SECRET),
  validateRequest(updateOrderStatusSchema),
  orderController.updateOrderStatus,
);

export default router;
