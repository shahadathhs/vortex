import express, { Router } from 'express';

import { webhookController } from '../controllers/webhook.controller';

const router: Router = Router();

const rawJson = express.raw({ type: 'application/json' });

router.post('/stripe', rawJson, webhookController.handleStripe);
router.post('/stripe-connect', rawJson, webhookController.handleStripeConnect);

export default router;
