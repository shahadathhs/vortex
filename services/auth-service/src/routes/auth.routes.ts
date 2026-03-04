import {
  asyncHandler,
  protect,
  requireUser,
  validateRequest,
} from '@vortex/common';
import { Router } from 'express';

import { authController } from '../controllers/auth.controller';
import { authService } from '../services/auth.service';
import { config } from '../config/config';
import {
  forgotPasswordSchema,
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  resetPasswordSchema,
  tfaDisableSchema,
  tfaOtpSchema,
  tfaVerifyLoginSchema,
  updatePasswordSchema,
  updateProfileSchema,
} from '../schemas/auth.schema';

import sellerRoutes from './seller.routes';

const router: Router = Router();

const auth = [
  protect(config.JWT_SECRET, {
    fetchUser: authService.fetchUserForAuth,
  }),
  requireUser,
];

// System: seller management (protected)
router.use('/sellers', sellerRoutes);

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
router.post(
  '/forgot-password',
  validateRequest(forgotPasswordSchema),
  asyncHandler(authController.forgotPassword),
);
router.post(
  '/reset-password',
  validateRequest(resetPasswordSchema),
  asyncHandler(authController.resetPassword),
);
router.post(
  '/tfa/verify-login',
  validateRequest(tfaVerifyLoginSchema),
  asyncHandler(authController.verifyTfaLogin),
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

router.post('/tfa/enable', ...auth, asyncHandler(authController.enableTfa));
router.post(
  '/tfa/verify-enable',
  ...auth,
  validateRequest(tfaOtpSchema),
  asyncHandler(authController.verifyTfaEnable),
);
router.post(
  '/tfa/disable',
  ...auth,
  validateRequest(tfaDisableSchema),
  asyncHandler(authController.disableTfa),
);

export default router;
