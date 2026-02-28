import { successResponse } from '@vortex/common';
import { Request, Response } from 'express';

import { productService } from '../services/product.service';
import { IProduct } from '../types/product.interface';

export class ProductController {
  public createProduct = async (req: Request, res: Response) => {
    const product = await productService.createProduct(
      req.body as Partial<IProduct>,
    );
    res
      .status(201)
      .json(successResponse(product, 'Product created successfully'));
  };

  public updateProduct = async (req: Request, res: Response) => {
    const product = await productService.updateProduct(
      req.params.id as string,
      req.body as Partial<IProduct>,
    );
    res.json(successResponse(product, 'Product updated successfully'));
  };

  public deleteProduct = async (req: Request, res: Response) => {
    const result = await productService.deleteProduct(req.params.id as string);
    res.json(successResponse(result, 'Product deleted successfully'));
  };

  public getProducts = async (req: Request, res: Response) => {
    const products = await productService.getProducts(
      req.query as Record<string, unknown>,
    );
    res.json(successResponse(products, 'Products retrieved'));
  };

  public getProductById = async (req: Request, res: Response) => {
    const product = await productService.getProductById(
      req.params.id as string,
    );
    res.json(successResponse(product, 'Product retrieved'));
  };
}

export const productController = new ProductController();
