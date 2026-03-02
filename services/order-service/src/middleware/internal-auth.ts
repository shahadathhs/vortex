import { UnauthorizedError } from '@vortex/common';
import type { Request, Response, NextFunction } from 'express';

import { config } from '../config/config';

const internalSecret = config.get('INTERNAL_SECRET' as never);

export function requireInternalSecret(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const secret = req.headers['x-internal-secret'];
  if (!internalSecret || secret !== internalSecret) {
    return next(new UnauthorizedError('Invalid internal secret'));
  }
  next();
}
