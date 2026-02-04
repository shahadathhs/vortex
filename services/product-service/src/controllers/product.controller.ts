import { NextFunction, Request, Response } from 'express';

import { productService } from '../services/product.service';
import { IProduct } from '../types/product.interface';

export class ProductController {
  public createProduct = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const product = await productService.createProduct(
        req.body as Partial<IProduct>,
      );
      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  };

  public getProducts = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const products = await productService.getProducts(
        req.query as Record<string, unknown>,
      );
      res.json(products);
    } catch (error) {
      next(error);
    }
  };

  public getProductById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const product = await productService.getProductById(
        req.params.id as string,
      );
      res.json(product);
    } catch (error) {
      next(error);
    }
  };
}

export const productController = new ProductController();
