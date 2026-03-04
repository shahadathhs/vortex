import { successResponse } from '@vortex/common';
import type { Request, Response } from 'express';

import * as notificationSettingsService from '../services/notification-settings.service';

async function getSettings(req: Request, res: Response) {
  const userId = req.user!.id;
  const settings = await notificationSettingsService.getSettings(userId);
  res.json(successResponse(settings, 'Notification settings retrieved'));
}

async function updateSettings(req: Request, res: Response) {
  const userId = req.user!.id;
  const settings = await notificationSettingsService.updateSettings(
    userId,
    req.body,
  );
  res.json(successResponse(settings, 'Notification settings updated'));
}

export const notificationSettingsController = {
  getSettings,
  updateSettings,
};
