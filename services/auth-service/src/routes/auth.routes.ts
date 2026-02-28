import {
  asyncHandler,
  protect,
  requireUser,
  validateRequest,
} from '@vortex/common';
import { Router } from 'express';

import { config } from '../config/config';
import { authController } from '../controllers/auth.controller';
import { authService } from '../services/auth.service';
import {
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  updatePasswordSchema,
  updateProfileSchema,
} from '../schemas/auth.schema';

import adminRoutes from './admin.routes';

const router: Router = Router();

const auth = [
  protect(config.JWT_SECRET, {
    fetchUser: (id) => authService.fetchUserForAuth(id),
  }),
  requireUser,
];

// Superadmin/Admin management (protected)
router.use('/admin', adminRoutes);

// Public routes
router.post(
  '/register',
  validateRequest(registerSchema),
  asyncHandler(authController.register),
);
router.post(
  '/login',
  validateRequest(loginSchema),
  asyncHandler(authController.login),
);
router.post(
  '/refresh-token',
  validateRequest(refreshTokenSchema),
  asyncHandler(authController.refreshToken),
);
// Protected routes
router.get('/profile', ...auth, asyncHandler(authController.getProfile));
router.patch(
  '/profile',
  ...auth,
  validateRequest(updateProfileSchema),
  asyncHandler(authController.updateProfile),
);
router.patch(
  '/password',
  ...auth,
  validateRequest(updatePasswordSchema),
  asyncHandler(authController.updatePassword),
);
router.post('/logout', ...auth, asyncHandler(authController.logout));

export default router;
