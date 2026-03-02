import { NextFunction, Request, Response } from 'express';

import { NotFoundError } from '../errors/api-errors';

/** 404 handler for unmatched routes */
export const notFound = (req: Request, _res: Response, next: NextFunction) => {
  next(new NotFoundError(`Cannot ${req.method} ${req.originalUrl}`));
};
