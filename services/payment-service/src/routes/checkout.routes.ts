import { asyncHandler, protect, requireUser } from '@vortex/common';
import { Router } from 'express';

import { config } from '../config/config';
import { checkoutController } from '../controllers/checkout.controller';

const router: Router = Router();

const auth = [protect(config.JWT_SECRET), requireUser];

router.post('/', ...auth, asyncHandler(checkoutController.checkout));

export default router;
