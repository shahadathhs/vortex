import { asyncHandler, protect, requireUser } from '@vortex/common';
import { Router } from 'express';

import { config } from '../config/config';
import { notificationController } from '../controllers/notification.controller';

const router: Router = Router();

const auth = [protect(config.JWT_SECRET), requireUser];

router.get(
  '/',
  ...auth,
  asyncHandler((req, res) => notificationController.getNotifications(req, res)),
);

router.patch(
  '/:id/read',
  ...auth,
  asyncHandler((req, res) => notificationController.markAsRead(req, res)),
);

export default router;
