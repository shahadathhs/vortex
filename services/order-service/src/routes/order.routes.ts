import { validateRequest } from '@vortex/common';
import { Router } from 'express';

import { orderController } from '../controllers/order.controller';
import { createOrderSchema } from '../schemas/order.schema';

const router: Router = Router();

router.post(
  '/',
  validateRequest(createOrderSchema),
  orderController.createOrder,
);

export default router;
