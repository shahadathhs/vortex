import { logger } from '@vortex/common';
import type { Request, Response } from 'express';

import {
  handlePaymentFailed,
  handlePaymentSucceeded,
} from '../services/checkout.service';
import { constructWebhookEvent } from '../services/stripe.service';
import { config } from '../config/config';
import { updateUserStripeOnboardingByAccountId } from '../lib/http-client';

async function handleStripe(req: Request, res: Response) {
  const signature = req.headers['stripe-signature'] as string;
  if (!signature) {
    res.status(400).send('Missing stripe-signature header');
    return;
  }

  const rawBody = req.body;
  if (!rawBody) {
    res.status(400).send('Missing body');
    return;
  }

  let event;
  try {
    event = constructWebhookEvent(rawBody, signature);
  } catch (err) {
    logger.error('Webhook signature verification failed:', err);
    res.status(400).send('Invalid signature');
    return;
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const orderId = event.data.object.metadata?.orderId;
        if (orderId) {
          await handlePaymentSucceeded(orderId);
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const orderId = event.data.object.metadata?.orderId;
        if (orderId) {
          await handlePaymentFailed(orderId);
        }
        break;
      }
      default:
        logger.info('Unhandled webhook event:', event.type);
    }
    res.status(200).json({ received: true });
  } catch (err) {
    logger.error('Webhook handler error:', err);
    res.status(500).send('Webhook handler failed');
  }
}

async function handleStripeConnect(req: Request, res: Response) {
  if (!config.STRIPE_CONNECT_WEBHOOK_SECRET) {
    res.status(503).send('Connect webhook not configured');
    return;
  }

  const signature = req.headers['stripe-signature'] as string;
  if (!signature) {
    res.status(400).send('Missing stripe-signature header');
    return;
  }

  const rawBody = req.body;
  if (!rawBody) {
    res.status(400).send('Missing body');
    return;
  }

  let event;
  try {
    event = constructWebhookEvent(
      rawBody,
      signature,
      config.STRIPE_CONNECT_WEBHOOK_SECRET,
    );
  } catch (err) {
    logger.error('Connect webhook signature verification failed:', err);
    res.status(400).send('Invalid signature');
    return;
  }

  try {
    if (event.type === 'account.updated') {
      const accountId = event.data.object.id;
      await updateUserStripeOnboardingByAccountId(accountId);
    }
    res.status(200).json({ received: true });
  } catch (err) {
    logger.error('Connect webhook handler error:', err);
    res.status(500).send('Webhook handler failed');
  }
}

export const webhookController = {
  handleStripe,
  handleStripeConnect,
};
