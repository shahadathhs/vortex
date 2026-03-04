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
import { connectController } from '../controllers/connect.controller';
import { paymentSettingsController } from '../controllers/payment-settings.controller';
import { settlementController } from '../controllers/settlement.controller';
import {
  connectOnboardingSchema,
  updatePaymentSettingsSchema,
} from '../schemas/payment.schema';

const router: Router = Router();

const auth = [protect(config.JWT_SECRET), requireUser];
const systemAuth = [
  ...auth,
  checkPermission(Permission.PAYMENT_SETTINGS_MANAGE),
];
const settlementAuth = [
  ...auth,
  checkPermission(Permission.PAYMENT_SETTLEMENT),
];

router.get(
  '/settings',
  ...systemAuth,
  asyncHandler(paymentSettingsController.getSettings),
);
router.patch(
  '/settings',
  ...systemAuth,
  validateRequest(updatePaymentSettingsSchema),
  asyncHandler(paymentSettingsController.updateSettings),
);

router.post(
  '/connect/onboarding',
  ...auth,
  validateRequest(connectOnboardingSchema),
  asyncHandler(connectController.createOnboardingLink),
);
router.post(
  '/connect/login-link',
  ...auth,
  asyncHandler(connectController.createLoginLink),
);
router.get(
  '/connect/status',
  ...auth,
  asyncHandler(connectController.getConnectStatus),
);

router.post(
  '/settlement/run',
  ...settlementAuth,
  asyncHandler(settlementController.runSettlement),
);

export default router;
