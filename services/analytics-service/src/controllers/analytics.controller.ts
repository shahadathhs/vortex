import { AuthRequest, successResponse } from '@vortex/common';
import { Response } from 'express';

import { fetchOrders } from '../lib/http-client';
import { fetchProducts } from '../lib/http-client';

export const analyticsController = {
  async getDashboard(req: AuthRequest, res: Response) {
    const user = req.user!;
    const [orders, products] = await Promise.all([
      fetchOrders(),
      fetchProducts(),
    ]);

    if (user.role === 'system') {
      const totalRevenue = orders
        .filter((o) =>
          ['confirmed', 'shipped', 'delivered', 'completed'].includes(o.status),
        )
        .reduce((sum, o) => sum + o.totalPrice, 0);
      const lowStock = products.filter((p) => p.stock > 0 && p.stock < 5);
      const outOfStock = products.filter((p) => p.stock <= 0);

      return res.json(
        successResponse(
          {
            role: 'system',
            metrics: {
              totalOrders: orders.length,
              totalRevenue,
              totalProducts: products.length,
              lowStockCount: lowStock.length,
              outOfStockCount: outOfStock.length,
              uniqueBuyers: new Set(orders.map((o) => o.userId)).size,
              uniqueSellers: new Set(
                products.map((p) => p.sellerId).filter(Boolean),
              ).size,
            },
            recentOrders: orders.slice(0, 10),
            lowStockProducts: lowStock.slice(0, 10),
          },
          'Dashboard retrieved',
        ),
      );
    }

    if (user.role === 'seller') {
      const myProducts = products.filter((p) => p.sellerId === user.id);
      const myProductIds = new Set(myProducts.map((p) => p._id));
      const myOrders = orders.filter((o) =>
        o.items.some((i) => myProductIds.has(i.productId)),
      );
      const myRevenue = myOrders
        .filter((o) =>
          ['confirmed', 'shipped', 'delivered', 'completed'].includes(o.status),
        )
        .reduce((sum, o) => {
          const myItemsTotal = o.items
            .filter((i) => myProductIds.has(i.productId))
            .reduce((s, i) => s + i.price * i.quantity, 0);
          return sum + myItemsTotal;
        }, 0);
      const lowStock = myProducts.filter((p) => p.stock > 0 && p.stock < 5);

      return res.json(
        successResponse(
          {
            role: 'seller',
            metrics: {
              totalProducts: myProducts.length,
              totalOrders: myOrders.length,
              totalRevenue: myRevenue,
              lowStockCount: lowStock.length,
            },
            lowStockProducts: lowStock.slice(0, 10),
            recentOrders: myOrders.slice(0, 10),
          },
          'Dashboard retrieved',
        ),
      );
    }

    if (user.role === 'buyer') {
      const myOrders = orders.filter((o) => o.userId === user.id);
      const totalSpent = myOrders
        .filter((o) =>
          ['confirmed', 'shipped', 'delivered', 'completed'].includes(o.status),
        )
        .reduce((sum, o) => sum + o.totalPrice, 0);

      return res.json(
        successResponse(
          {
            role: 'buyer',
            metrics: {
              totalOrders: myOrders.length,
              totalSpent,
            },
            recentOrders: myOrders.slice(0, 10),
          },
          'Dashboard retrieved',
        ),
      );
    }

    return res.status(403).json({ message: 'Unknown role' });
  },
};
