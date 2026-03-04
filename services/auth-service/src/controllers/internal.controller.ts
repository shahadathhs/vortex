import { successResponse } from '@vortex/common';
import type { Request, Response } from 'express';

import { authService } from '../services/auth.service';

async function getUser(req: Request, res: Response) {
  const id = String(req.params.id ?? '');
  const user = await authService.getUserById(id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.json(successResponse(user, 'User retrieved'));
}

async function updateStripeAccount(req: Request, res: Response) {
  const id = String(req.params.id ?? '');
  const { stripeAccountId, stripeOnboardingComplete } = req.body;
  const user = await authService.updateStripeAccount(id, {
    stripeAccountId,
    stripeOnboardingComplete,
  });
  res.json(successResponse(user, 'Stripe account updated'));
}

async function updateStripeOnboardingByAccountId(req: Request, res: Response) {
  const accountId = String(req.params.accountId ?? '');
  const user = await authService.updateStripeOnboardingByAccountId(accountId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.json(successResponse(user, 'Stripe onboarding updated'));
}

export const internalController = {
  getUser,
  updateStripeAccount,
  updateStripeOnboardingByAccountId,
};
