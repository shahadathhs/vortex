import { Router } from 'express';

import { requireInternalSecret } from '../middleware/internal-auth';
import { internalController } from '../controllers/internal.controller';

const router: Router = Router();

router.use(requireInternalSecret);

router.get('/orders/:id', internalController.getOrder);
router.post('/orders', internalController.createOrder);
router.post('/cart/clear', internalController.clearCart);
router.put('/orders/:id/status', internalController.updateOrderStatus);

export default router;
