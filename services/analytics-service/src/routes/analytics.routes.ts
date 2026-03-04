import {
  asyncHandler,
  checkAnyPermission,
  Permission,
  protect,
  requireUser,
  validateRequest,
} from '@vortex/common';
import { Router } from 'express';

import { config } from '../config/config';
import { analyticsController } from '../controllers/analytics.controller';
import {
  getAnalyticsOrdersSchema,
  getAnalyticsProductsSchema,
  getDashboardSchema,
} from '../schemas/analytics.schema';

const router: Router = Router();

const auth = [protect(config.JWT_SECRET), requireUser];
const analyticsAuth = [
  ...auth,
  checkAnyPermission([
    Permission.ANALYTICS_SYSTEM,
    Permission.ANALYTICS_SELLER,
    Permission.ANALYTICS_BUYER,
  ]),
];

router.get(
  '/dashboard',
  ...analyticsAuth,
  validateRequest(getDashboardSchema),
  asyncHandler((req, res) => analyticsController.getDashboard(req, res)),
);

router.get(
  '/orders',
  ...analyticsAuth,
  validateRequest(getAnalyticsOrdersSchema),
  asyncHandler((req, res) => analyticsController.getOrders(req, res)),
);

router.get(
  '/products',
  ...analyticsAuth,
  validateRequest(getAnalyticsProductsSchema),
  asyncHandler((req, res) => analyticsController.getProducts(req, res)),
);

export default router;
