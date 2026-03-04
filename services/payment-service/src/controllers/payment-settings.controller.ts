import { successResponse } from '@vortex/common';
import type { Request, Response } from 'express';

import * as paymentSettingsService from '../services/payment-settings.service';

async function getSettings(_req: Request, res: Response) {
  const settings = await paymentSettingsService.getPaymentSettings();
  res.json(successResponse(settings, 'Payment settings retrieved'));
}

async function updateSettings(req: Request, res: Response) {
  const settings = await paymentSettingsService.updatePaymentSettings(req.body);
  res.json(successResponse(settings, 'Payment settings updated'));
}

export const paymentSettingsController = {
  getSettings,
  updateSettings,
};
