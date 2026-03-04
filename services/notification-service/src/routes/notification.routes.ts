import {
  asyncHandler,
  checkPermission,
  Permission,
  protect,
  requireUser,
  validateRequest,
} from '@vortex/common';
import { Router } from 'express';

import { config } from '../config/config';
import { notificationController } from '../controllers/notification.controller';
import { notificationSettingsController } from '../controllers/notification-settings.controller';
import {
  getNotificationsSchema,
  notificationIdParamSchema,
} from '../schemas/notification.schema';
import { updateNotificationSettingsSchema } from '../schemas/notification-settings.schema';

const router: Router = Router();

const auth = [protect(config.JWT_SECRET), requireUser];

router.get(
  '/settings',
  ...auth,
  checkPermission(Permission.NOTIFICATION_READ),
  asyncHandler((req, res) =>
    notificationSettingsController.getSettings(req, res),
  ),
);

router.patch(
  '/settings',
  ...auth,
  checkPermission(Permission.NOTIFICATION_UPDATE),
  validateRequest(updateNotificationSettingsSchema),
  asyncHandler((req, res) =>
    notificationSettingsController.updateSettings(req, res),
  ),
);

router.get(
  '/',
  ...auth,
  checkPermission(Permission.NOTIFICATION_READ),
  validateRequest(getNotificationsSchema),
  asyncHandler((req, res) => notificationController.getNotifications(req, res)),
);

router.patch(
  '/:id/read',
  ...auth,
  checkPermission(Permission.NOTIFICATION_UPDATE),
  validateRequest(notificationIdParamSchema),
  asyncHandler((req, res) => notificationController.markAsRead(req, res)),
);

export default router;
