import {
  asyncHandler,
  checkAnyPermission,
  checkPermission,
  Permission,
  protect,
  requireUser,
  validateRequest,
} from '@vortex/common';
import { Router } from 'express';

import { config } from '../config/config';
import { orderController } from '../controllers/order.controller';
import {
  getOrdersByUserSchema,
  getOrdersQuerySchema,
  orderIdParamSchema,
  updateOrderStatusSchema,
} from '../schemas/order.schema';

const auth = [protect(config.JWT_SECRET), requireUser];

const router: Router = Router();

router.get(
  '/',
  ...auth,
  checkAnyPermission([Permission.ORDER_VIEW_OWN, Permission.ORDER_MANAGE_ALL]),
  validateRequest(getOrdersQuerySchema),
  asyncHandler(orderController.getOrders),
);
router.get(
  '/user/:userId',
  ...auth,
  checkPermission(Permission.ORDER_MANAGE_ALL),
  validateRequest(getOrdersByUserSchema),
  asyncHandler(orderController.getOrdersByUser),
);
router.get(
  '/:id',
  ...auth,
  checkAnyPermission([Permission.ORDER_VIEW_OWN, Permission.ORDER_MANAGE_ALL]),
  validateRequest(orderIdParamSchema),
  asyncHandler(orderController.getOrderById),
);
router.put(
  '/:id/status',
  ...auth,
  checkPermission(Permission.ORDER_MANAGE_ALL),
  validateRequest(updateOrderStatusSchema),
  asyncHandler(orderController.updateOrderStatus),
);

export default router;
