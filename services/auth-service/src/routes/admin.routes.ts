import {
  checkPermission,
  Permission,
  protect,
  requireUser,
  validateRequest,
} from '@vortex/common';
import { Router } from 'express';

import { config } from '../config/config';
import { authController } from '../controllers/auth.controller';
import {
  adminIdParamSchema,
  adminResetPasswordSchema,
  createAdminSchema,
} from '../schemas/auth.schema';

const router: Router = Router();

const auth = [protect(config.JWT_SECRET), requireUser];

router.post(
  '/',
  ...auth,
  checkPermission(Permission.ADMIN_CREATE),
  validateRequest(createAdminSchema),
  authController.createAdmin,
);
router.get(
  '/',
  ...auth,
  checkPermission(Permission.ADMIN_LIST),
  authController.listAdmins,
);
router.delete(
  '/:id',
  ...auth,
  checkPermission(Permission.ADMIN_DELETE),
  validateRequest(adminIdParamSchema),
  authController.deleteAdmin,
);
router.post(
  '/reset-password',
  ...auth,
  checkPermission(Permission.ADMIN_RESET_PASSWORD),
  validateRequest(adminResetPasswordSchema),
  authController.resetUserPassword,
);

export default router;
