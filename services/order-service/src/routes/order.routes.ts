import { validateRequest } from '@vortex/common';
import { Router } from 'express';

import { orderController } from '../controllers/order.controller';
import {
  createOrderSchema,
  updateOrderStatusSchema,
} from '../schemas/order.schema';

const router: Router = Router();

router.post(
  '/',
  validateRequest(createOrderSchema),
  orderController.createOrder,
);
router.get('/', orderController.getOrders);
router.get('/user/:userId', orderController.getOrdersByUser);
router.get('/:id', orderController.getOrderById);
router.put(
  '/:id/status',
  validateRequest(updateOrderStatusSchema),
  orderController.updateOrderStatus,
);

export default router;
