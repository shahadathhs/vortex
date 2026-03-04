import { Router } from 'express';

import { requireInternalSecret } from '../middleware/internal-auth';
import { internalController } from '../controllers/internal.controller';

const router: Router = Router();

router.use(requireInternalSecret);

router.patch(
  '/users/by-stripe-account/:accountId/onboarding',
  internalController.updateStripeOnboardingByAccountId,
);
router.get('/users/:id', internalController.getUser);
router.patch('/users/:id/stripe', internalController.updateStripeAccount);

export default router;
