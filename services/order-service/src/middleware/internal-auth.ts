import { UnauthorizedError } from '@vortex/common';
import type { Request, Response, NextFunction } from 'express';

import { config } from '../config/config';

export function requireInternalSecret(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const secret = req.headers['x-internal-secret'];
  if (secret !== config.INTERNAL_SECRET) {
    return next(new UnauthorizedError('Invalid internal secret'));
  }
  next();
}
