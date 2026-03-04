import { successResponse } from '@vortex/common';
import type { Request, Response } from 'express';

import * as connectService from '../services/connect.service';

async function createOnboardingLink(req: Request, res: Response) {
  const userId = req.user?.id ?? '';
  const { refreshUrl, returnUrl } = req.body;
  const result = await connectService.createOnboardingLink(
    userId,
    refreshUrl,
    returnUrl,
  );
  res.json(successResponse(result, 'Onboarding link created'));
}

async function createLoginLink(req: Request, res: Response) {
  const userId = req.user?.id ?? '';
  const result = await connectService.createLoginLink(userId);
  res.json(successResponse(result, 'Login link created'));
}

async function getConnectStatus(req: Request, res: Response) {
  const userId = req.user?.id ?? '';
  const result = await connectService.getConnectAccountStatus(userId);
  res.json(successResponse(result, 'Connect status retrieved'));
}

export const connectController = {
  createOnboardingLink,
  createLoginLink,
  getConnectStatus,
};
