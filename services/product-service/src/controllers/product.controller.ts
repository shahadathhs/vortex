import {
  AuthRequest,
  getPagination,
  HttpStatusCode,
  publishActivity,
  successPaginatedResponse,
  successResponse,
} from '@vortex/common';
import { Request, Response } from 'express';

import { config } from '../config/config';
import { productService } from '../services/product.service';
import { IProduct } from '../types/product.interface';

function getActor(req: Request): { userId: string; role: string } | undefined {
  const u = (req as AuthRequest).user;
  if (!u) return undefined;
  return { userId: u.id, role: u.role };
}

function getReqMeta(req: Request) {
  return {
    ip: req.ip ?? req.socket?.remoteAddress,
    userAgent: req.get('user-agent'),
  };
}

async function createProduct(req: AuthRequest, res: Response) {
  const product = await productService.createProduct(
    req.body as Partial<IProduct>,
    getActor(req),
  );
  const actor = req.user!;
  await publishActivity(config.RABBITMQ_URL, {
    actorId: actor.id,
    actorRole: actor.role,
    actorEmail: actor.email,
    action: 'product.created',
    resource: 'product',
    resourceId: String(product._id),
    metadata: { name: product.name, sellerId: product.sellerId },
    ...getReqMeta(req),
  });
  res
    .status(HttpStatusCode.CREATED)
    .json(successResponse(product, 'Product created successfully'));
}

async function updateProduct(req: AuthRequest, res: Response) {
  const product = await productService.updateProduct(
    req.params.id as string,
    req.body as Partial<IProduct>,
    getActor(req),
  );
  const actor = req.user!;
  await publishActivity(config.RABBITMQ_URL, {
    actorId: actor.id,
    actorRole: actor.role,
    actorEmail: actor.email,
    action: 'product.updated',
    resource: 'product',
    resourceId: String(product._id),
    metadata: { name: product.name },
    ...getReqMeta(req),
  });
  res.json(successResponse(product, 'Product updated successfully'));
}

async function deleteProduct(req: AuthRequest, res: Response) {
  const productId = req.params.id as string;
  const result = await productService.deleteProduct(productId, getActor(req));
  const actor = req.user!;
  await publishActivity(config.RABBITMQ_URL, {
    actorId: actor.id,
    actorRole: actor.role,
    actorEmail: actor.email,
    action: 'product.deleted',
    resource: 'product',
    resourceId: productId,
    ...getReqMeta(req),
  });
  res.json(successResponse(result, 'Product deleted successfully'));
}

async function getProducts(req: Request, res: Response) {
  const { page, limit, skip } = getPagination(req.query);
  const query = {
    ...(req.query as Record<string, unknown>),
    skip,
    limit,
  };
  const { products, total } = await productService.getProducts(
    query,
    getActor(req),
  );
  res.json(
    successPaginatedResponse(
      products,
      { page, limit, total },
      'Products retrieved',
    ),
  );
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
