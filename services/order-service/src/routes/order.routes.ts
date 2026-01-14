import { Router } from 'express';
import { orderController } from '../controllers/order.controller';

const router: Router = Router();

router.post('/', orderController.createOrder);

export default router;
