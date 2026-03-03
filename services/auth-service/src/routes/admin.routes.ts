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
  checkPermission(Permission.ADMIN_CREATE),
  validateRequest(createAdminSchema),
  asyncHandler(authController.createAdmin),
);
router.get(
  '/',
  ...auth,
  checkPermission(Permission.ADMIN_LIST),
  asyncHandler(authController.listAdmins),
);
router.delete(
  '/:id',
  ...auth,
  checkPermission(Permission.ADMIN_DELETE),
  validateRequest(adminIdParamSchema),
  asyncHandler(authController.deleteAdmin),
);
router.post(
  '/reset-password',
  ...auth,
  checkPermission(Permission.ADMIN_RESET_PASSWORD),
  validateRequest(adminResetPasswordSchema),
  asyncHandler(authController.resetUserPassword),
);

export default router;
