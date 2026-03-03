import { successResponse } from '@vortex/common';
import { Request, Response } from 'express';

import * as checkoutService from '../services/checkout.service';

async function checkout(req: Request, res: Response) {
  const authHeader = req.headers.authorization ?? '';
  const userId = req.user?.id ?? '';
  const userEmail = req.user?.email;
  const result = await checkoutService.checkout(authHeader, userId, userEmail);
  res.status(200).json(successResponse(result, 'Checkout initiated'));
}

export const checkoutController = {
  checkout,
};
