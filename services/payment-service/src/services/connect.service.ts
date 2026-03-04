import Stripe from 'stripe';

import { config } from '../config/config';
import { getUser, updateUserStripeAccount } from '../lib/http-client';

let stripe: Stripe | null = null;
if (config.STRIPE_SECRET_KEY) {
  stripe = new Stripe(config.STRIPE_SECRET_KEY);
}

export async function createConnectAccount(sellerId: string, email: string) {
  if (!stripe) throw new Error('Stripe is not configured');

  const account = await stripe.accounts.create({
    type: 'express',
    country: 'US',
    email,
  });

  await updateUserStripeAccount(sellerId, {
    stripeAccountId: account.id,
    stripeOnboardingComplete: false,
  });

  return account;
}

export async function createOnboardingLink(
  sellerId: string,
  refreshUrl: string,
  returnUrl: string,
) {
  if (!stripe) throw new Error('Stripe is not configured');

  const userRes = await getUser(sellerId);
  const user = userRes?.data as
    | { email?: string; stripeAccountId?: string }
    | undefined;
  const email = user?.email;
  let accountId = user?.stripeAccountId;

  if (!accountId) {
    if (!email) throw new Error('User not found');
    const account = await createConnectAccount(sellerId, email);
    accountId = account.id;
  }

  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  });

  return { url: link.url };
}

export async function createLoginLink(sellerId: string) {
  if (!stripe) throw new Error('Stripe is not configured');

  const userRes = await getUser(sellerId);
  const accountId = userRes?.data?.stripeAccountId;
  if (!accountId) throw new Error('Seller has no Stripe Connect account');

  const link = await stripe.accounts.createLoginLink(accountId);
  return { url: link.url };
}

export async function getConnectAccountStatus(sellerId: string) {
  if (!stripe) throw new Error('Stripe is not configured');

  const userRes = await getUser(sellerId);
  const accountId = userRes?.data?.stripeAccountId;
  if (!accountId) {
    return { hasAccount: false, chargesEnabled: false, payoutsEnabled: false };
  }

  const account = await stripe.accounts.retrieve(accountId);
  return {
    hasAccount: true,
    chargesEnabled: account.charges_enabled ?? false,
    payoutsEnabled: account.payouts_enabled ?? false,
    detailsSubmitted: account.details_submitted ?? false,
  };
}

export async function transferToConnectAccount(
  accountId: string,
  amountCents: number,
  description: string,
) {
  if (!stripe) throw new Error('Stripe is not configured');
  if (amountCents < 1)
    throw new Error('Transfer amount must be at least 1 cent');

  const transfer = await stripe.transfers.create({
    amount: amountCents,
    currency: 'usd',
    destination: accountId,
    description,
  });

  return transfer;
}
