import { Router } from 'express';
import { productController } from '../controllers/product.controller';

const router: Router = Router();

router.post('/', productController.createProduct);
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

export default router;
