import {
  asyncHandler,
  ForbiddenError,
  Permission,
  protect,
  requireUser,
  Role,
  RolePermissions,
} from '@vortex/common';
import { NextFunction, Request, Response, Router } from 'express';

import { config } from '../config/config';
import { analyticsController } from '../controllers/analytics.controller';

const router: Router = Router();

const auth = [protect(config.JWT_SECRET), requireUser];

function requireAnalyticsAccess(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const user = req.user;
  if (!user) return next();
  const perms = RolePermissions[user.role as Role] ?? [];
  const hasAccess =
    perms.includes(Permission.ANALYTICS_SYSTEM) ||
    perms.includes(Permission.ANALYTICS_SELLER) ||
    perms.includes(Permission.ANALYTICS_BUYER);
  if (!hasAccess) {
    return next(new ForbiddenError('Analytics access required'));
  }
  next();
}

router.get(
  '/dashboard',
  ...auth,
  requireAnalyticsAccess,
  asyncHandler((req, res) => analyticsController.getDashboard(req, res)),
);

export default router;
