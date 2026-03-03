import {
  asyncHandler,
  checkPermission,
  Permission,
  protect,
  requireUser,
} from '@vortex/common';
import { Router } from 'express';

import { config } from '../config/config';
import { activityController } from '../controllers/activity.controller';

const router: Router = Router();

const auth = [protect(config.JWT_SECRET), requireUser];

router.get('/health', (req, res) => {
  res.json({
    service: 'activity-service',
    status: 'healthy',
    timestamp: new Date(),
  });
});

router.get(
  '/',
  ...auth,
  checkPermission(Permission.ACTIVITY_VIEW_ALL),
  asyncHandler((req, res) => activityController.getActivities(req, res)),
);

export default router;
