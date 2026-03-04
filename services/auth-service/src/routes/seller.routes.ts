import {
  asyncHandler,
  checkPermission,
  Permission,
  protect,
  requireUser,
  validateRequest,
} from '@vortex/common';
import { Router } from 'express';

import { authController } from '../controllers/auth.controller';
import { authService } from '../services/auth.service';
import { config } from '../config/config';
import {
  adminIdParamSchema,
  adminResetPasswordSchema,
  createAdminSchema,
} from '../schemas/auth.schema';

const router: Router = Router();

const auth = [
  protect(config.JWT_SECRET, {
    fetchUser: authService.fetchUserForAuth,
  }),
  requireUser,
];

router.post(
  '/',
  ...auth,
  checkPermission(Permission.SELLER_CREATE),
  validateRequest(createAdminSchema),
  asyncHandler(authController.createSeller),
);
router.get(
  '/',
  ...auth,
  checkPermission(Permission.SELLER_LIST),
  asyncHandler(authController.listSellers),
);
router.delete(
  '/:id',
  ...auth,
  checkPermission(Permission.SELLER_DELETE),
  validateRequest(adminIdParamSchema),
  asyncHandler(authController.deleteSeller),
);
router.post(
  '/reset-password',
  ...auth,
  checkPermission(Permission.SELLER_RESET_PASSWORD),
  validateRequest(adminResetPasswordSchema),
  asyncHandler(authController.resetUserPassword),
);

export default router;
