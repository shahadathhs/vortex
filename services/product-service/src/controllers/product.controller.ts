import { HttpStatusCode, successResponse } from '@vortex/common';
import { Request, Response } from 'express';

import { productService } from '../services/product.service';
import { IProduct } from '../types/product.interface';

async function createProduct(req: Request, res: Response) {
  const product = await productService.createProduct(
    req.body as Partial<IProduct>,
  );
  res
    .status(HttpStatusCode.CREATED)
    .json(successResponse(product, 'Product created successfully'));
}

async function updateProduct(req: Request, res: Response) {
  const product = await productService.updateProduct(
    req.params.id as string,
    req.body as Partial<IProduct>,
  );
  res.json(successResponse(product, 'Product updated successfully'));
}

async function deleteProduct(req: Request, res: Response) {
  const result = await productService.deleteProduct(req.params.id as string);
  res.json(successResponse(result, 'Product deleted successfully'));
}

async function getProducts(req: Request, res: Response) {
  const products = await productService.getProducts(
    req.query as Record<string, unknown>,
  );
  res.json(successResponse(products, 'Products retrieved'));
}

async function getProductById(req: Request, res: Response) {
  const product = await productService.getProductById(req.params.id as string);
  res.json(successResponse(product, 'Product retrieved'));
}

export const productController = {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProductById,
};
