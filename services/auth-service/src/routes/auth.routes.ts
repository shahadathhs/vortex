import { protect, requireUser, validateRequest } from '@vortex/common';
import { Router } from 'express';

import { config } from '../config/config';
import { authController } from '../controllers/auth.controller';
import {
  loginSchema,
  refreshTokenSchema,
  registerSchema,
} from '../schemas/auth.schema';

import adminRoutes from './admin.routes';

const router: Router = Router();

// Superadmin/Admin management (protected)
router.use('/admin', adminRoutes);

// Public routes
router.post(
  '/register',
  validateRequest(registerSchema),
  authController.register,
);
router.post('/login', validateRequest(loginSchema), authController.login);
router.post(
  '/refresh-token',
  validateRequest(refreshTokenSchema),
  authController.refreshToken,
);
// Protected routes
router.get(
  '/profile',
  protect(config.JWT_SECRET),
  requireUser,
  authController.getProfile,
);
router.post(
  '/logout',
  protect(config.JWT_SECRET),
  requireUser,
  authController.logout,
);

export default router;
