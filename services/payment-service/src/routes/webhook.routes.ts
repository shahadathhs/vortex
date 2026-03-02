import express, { Router } from 'express';

import { webhookController } from '../controllers/webhook.controller';

const router: Router = Router();

router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  webhookController.handleStripe,
);

export default router;
