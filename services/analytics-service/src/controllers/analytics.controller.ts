import {
  AuthRequest,
  ForbiddenError,
  getDateRangeFromPreset,
  successResponse,
} from '@vortex/common';
import { Response } from 'express';

import { fetchOrders, fetchProducts } from '../lib/http-client';

function filterByDateRange<T extends { createdAt?: string }>(
  items: T[],
  from?: Date,
  to?: Date,
): T[] {
  if (!from && !to) return items;
  return items.filter((item) => {
    const d = item.createdAt ? new Date(item.createdAt).getTime() : 0;
    if (from && d < from.getTime()) return false;
    if (to && d > to.getTime()) return false;
    return true;
  });
}

function groupOrdersByStatus(
  orders: { status: string }[],
): Record<string, number> {
  return orders.reduce(
    (acc, o) => {
      acc[o.status] = (acc[o.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
}

function groupProductsBySeller(
  products: { sellerId?: string }[],
): Record<string, number> {
  return products.reduce(
    (acc, p) => {
      const key = p.sellerId ?? '_unknown';
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
}

function groupProductsByCategory(
  products: { category?: string }[],
): Record<string, number> {
  return products.reduce(
    (acc, p) => {
      const key = p.category ?? '_uncategorized';
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
}

export const analyticsController = {
  async getDashboard(req: AuthRequest, res: Response) {
    const user = req.user!;
    const dateFilter = req.query.dateFilter as string | undefined;
    const groupBy = req.query.groupBy as
      | 'status'
      | 'seller'
      | 'category'
      | undefined;
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

    const dateRange = dateFilter ? getDateRangeFromPreset(dateFilter) : null;

    const [ordersResult, productsResult] = await Promise.all([
      fetchOrders(),
      fetchProducts({ limit: 1000 }),
    ]);
    const orders = Array.isArray(ordersResult)
      ? ordersResult
      : ordersResult.data;
    const products = Array.isArray(productsResult)
      ? productsResult
      : productsResult.data;

    const filteredOrders = dateRange
      ? filterByDateRange(
          orders as { createdAt?: string }[],
          dateRange.from,
          dateRange.to,
        )
      : orders;

    if (user.role === 'system') {
      const totalRevenue = (
        filteredOrders as { status: string; totalPrice: number }[]
      )
        .filter((o) =>
          ['confirmed', 'shipped', 'delivered', 'completed'].includes(o.status),
        )
        .reduce((sum, o) => sum + o.totalPrice, 0);
      const lowStock = (products as { stock: number }[]).filter(
        (p) => p.stock > 0 && p.stock < 5,
      );
      const outOfStock = (products as { stock: number }[]).filter(
        (p) => p.stock <= 0,
      );
      const productsList = products as {
        stock: number;
        sellerId?: string;
        category?: string;
      }[];
      const ordersList = filteredOrders as { status: string; userId: string }[];

      const payload: Record<string, unknown> = {
        role: 'system',
        metrics: {
          totalOrders: ordersList.length,
          totalRevenue,
          totalProducts: productsList.length,
          lowStockCount: lowStock.length,
          outOfStockCount: outOfStock.length,
          uniqueBuyers: new Set(ordersList.map((o) => o.userId)).size,
          uniqueSellers: new Set(
            productsList.map((p) => p.sellerId).filter(Boolean),
          ).size,
        },
        recentOrders: (filteredOrders as unknown[]).slice(0, limit),
        lowStockProducts: lowStock.slice(0, limit),
      };
      if (groupBy === 'status') {
        payload.grouped = { byStatus: groupOrdersByStatus(ordersList) };
      } else if (groupBy === 'seller') {
        payload.grouped = { bySeller: groupProductsBySeller(productsList) };
      } else if (groupBy === 'category') {
        payload.grouped = { byCategory: groupProductsByCategory(productsList) };
      }

      return res.json(successResponse(payload, 'Dashboard retrieved'));
    }

    if (user.role === 'seller') {
      interface SellerProduct {
        _id: string;
        sellerId?: string;
        stock: number;
        category?: string;
      }
      interface SellerOrder {
        status?: string;
        items: { productId: string; price?: number; quantity?: number }[];
      }
      const productsList = products as SellerProduct[];
      const myProducts = productsList.filter((p) => p.sellerId === user.id);
      const myProductIds = new Set(myProducts.map((p) => p._id));
      const ordersList = filteredOrders as SellerOrder[];
      const myOrders = ordersList.filter((o) =>
        o.items.some((i) => myProductIds.has(i.productId)),
      );
      const myRevenue = myOrders
        .filter((o) =>
          ['confirmed', 'shipped', 'delivered', 'completed'].includes(
            o.status ?? '',
          ),
        )
        .reduce((sum, o) => {
          const myItemsTotal = o.items
            .filter((i) => myProductIds.has(i.productId))
            .reduce((s, i) => s + (i.price ?? 0) * (i.quantity ?? 0), 0);
          return sum + myItemsTotal;
        }, 0);
      const lowStock = myProducts.filter((p) => p.stock > 0 && p.stock < 5);

      const payload: Record<string, unknown> = {
        role: 'seller',
        metrics: {
          totalProducts: myProducts.length,
          totalOrders: myOrders.length,
          totalRevenue: myRevenue,
          lowStockCount: lowStock.length,
        },
        lowStockProducts: lowStock.slice(0, limit),
        recentOrders: myOrders.slice(0, limit),
      };
      if (groupBy === 'status') {
        payload.grouped = {
          byStatus: groupOrdersByStatus(
            myOrders.map((o) => ({ status: o.status ?? 'unknown' })),
          ),
        };
      } else if (groupBy === 'category') {
        payload.grouped = {
          byCategory: groupProductsByCategory(myProducts),
        };
      }
      return res.json(successResponse(payload, 'Dashboard retrieved'));
    }

    if (user.role === 'buyer') {
      interface OrderWithFields {
        userId: string;
        status?: string;
        totalPrice?: number;
      }
      const ordersList = filteredOrders as OrderWithFields[];
      const myOrders = ordersList.filter((o) => o.userId === user.id);
      const totalSpent = myOrders
        .filter((o) =>
          ['confirmed', 'shipped', 'delivered', 'completed'].includes(
            o.status ?? '',
          ),
        )
        .reduce((sum, o) => sum + (o.totalPrice ?? 0), 0);

      const payload: Record<string, unknown> = {
        role: 'buyer',
        metrics: {
          totalOrders: myOrders.length,
          totalSpent,
        },
        recentOrders: myOrders.slice(0, limit),
      };
      if (groupBy === 'status') {
        payload.grouped = {
          byStatus: groupOrdersByStatus(
            myOrders.map((o) => ({ status: o.status ?? 'unknown' })),
          ),
        };
      }
      return res.json(successResponse(payload, 'Dashboard retrieved'));
    }

    throw new ForbiddenError('Unknown role');
  },

  async getOrders(req: AuthRequest, res: Response) {
    const user = req.user!;
    const page = Number(req.query.page) || 1;
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const dateFilter = req.query.dateFilter as string | undefined;
    const status = req.query.status as string | undefined;

    const dateRange = dateFilter ? getDateRangeFromPreset(dateFilter) : null;
    const result = await fetchOrders({
      page: user.role === 'system' ? page : 1,
      limit: user.role === 'system' ? limit : 1000,
      status,
    });

    const orders = Array.isArray(result) ? result : result.data;
    const productsResult = await fetchProducts({ limit: 1000 });
    const allProducts = Array.isArray(productsResult)
      ? productsResult
      : productsResult.data;
    const productMap = new Map(
      (allProducts as { _id: string; sellerId?: string }[]).map((p) => [
        p._id,
        p,
      ]),
    );

    let filtered = orders as {
      items: { productId: string }[];
      userId: string;
      createdAt?: string;
    }[];
    if (user.role === 'seller') {
      filtered = filtered.filter((o) =>
        o.items.some((i) => productMap.get(i.productId)?.sellerId === user.id),
      );
    } else if (user.role === 'buyer') {
      filtered = filtered.filter((o) => o.userId === user.id);
    }

    const dateFiltered = dateRange
      ? filterByDateRange(filtered, dateRange.from, dateRange.to)
      : filtered;

    const total = dateFiltered.length;
    const skip = (page - 1) * limit;
    const paged = dateFiltered.slice(skip, skip + limit);

    const { successPaginatedResponse } = await import('@vortex/common');
    return res.json(
      successPaginatedResponse(
        paged as unknown[],
        { page, limit, total },
        'Orders retrieved',
      ),
    );
  },

  async getProducts(req: AuthRequest, res: Response) {
    const user = req.user!;
    const page = Number(req.query.page) || 1;
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const category = req.query.category as string | undefined;

    const result = await fetchProducts({
      page: user.role === 'system' ? page : 1,
      limit: user.role === 'system' ? limit : 1000,
      category,
    });

    const products = Array.isArray(result) ? result : result.data;
    let filtered = products as { sellerId?: string }[];
    if (user.role === 'seller') {
      filtered = filtered.filter((p) => p.sellerId === user.id);
    }

    const total = filtered.length;
    const skip = (page - 1) * limit;
    const paged = filtered.slice(skip, skip + limit);

    const { successPaginatedResponse } = await import('@vortex/common');
    return res.json(
      successPaginatedResponse(
        paged as unknown[],
        { page, limit, total },
        'Products retrieved',
      ),
    );
  },
};
