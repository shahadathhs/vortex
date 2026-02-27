import { protect, validateRequest } from '@vortex/common';
import { Router } from 'express';

import { config } from '../config/config';
import { authController } from '../controllers/auth.controller';
import {
  forgotPasswordSchema,
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  resetPasswordSchema,
} from '../schemas/auth.schema';

const router: Router = Router();

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
router.post(
  '/forgot-password',
  validateRequest(forgotPasswordSchema),
  authController.forgotPassword,
);
router.post(
  '/reset-password',
  validateRequest(resetPasswordSchema),
  authController.resetPassword,
);

// Protected routes
router.get('/profile', protect(config.JWT_SECRET), authController.getProfile);
router.post('/logout', protect(config.JWT_SECRET), authController.logout);

export default router;
