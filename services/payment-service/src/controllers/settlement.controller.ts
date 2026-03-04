import { successResponse } from '@vortex/common';
import type { Request, Response } from 'express';

import * as settlementService from '../services/settlement.service';

async function runSettlement(_req: Request, res: Response) {
  const result = await settlementService.runSettlement();
  res.json(successResponse(result, 'Settlement completed'));
}

export const settlementController = {
  runSettlement,
};
