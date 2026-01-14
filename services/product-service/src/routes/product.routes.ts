import { Router, Request, Response, NextFunction } from 'express';
import { Product } from '../models/Product';
import { AppError } from '@vortex/common';

const router: Router = Router();

// Create Product
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, price, stock } = req.body;
    const product = await Product.create({ name, description, price, stock });
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
});

// Get All Products / Search
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q } = req.query;
    let query = {};

    if (q) {
      query = { $text: { $search: q as string } };
    }

    const products = await Product.find(query);
    res.json(products);
  } catch (error) {
    next(error);
  }
});

// Get Product by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
});

export default router;
