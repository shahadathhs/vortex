import { Router } from 'express';

import { cartController } from '../controllers/cart.controller';

const router: Router = Router();

router.get('/', cartController.getCart);
router.post('/', cartController.addItem);
router.put('/:productId', cartController.updateItem);
router.delete('/:productId', cartController.removeItem);
router.post('/clear', cartController.clearCart);

export default router;
