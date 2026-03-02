import Stripe from 'stripe';

import { config } from '../config/config';

const secretKey = config.get('STRIPE_SECRET_KEY' as never);
let stripe: Stripe | null = null;

if (secretKey) {
  stripe = new Stripe(secretKey);
}

export async function createPaymentIntent(
  amountCents: number,
  orderId: string,
): Promise<{ client_secret: string | null }> {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }
  const intent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency: 'usd',
    metadata: { orderId },
    automatic_payment_methods: { enabled: true },
  });
  return { client_secret: intent.client_secret };
}

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
): Stripe.Event {
  const webhookSecret = config.get('STRIPE_WEBHOOK_SECRET' as never);
  if (!stripe || !webhookSecret) {
    throw new Error('Stripe webhook not configured');
  }
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}
