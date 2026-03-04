import { NextFunction, Request, Response } from 'express';

import { errorResponse } from '../utils/response';
import { logger } from '../utils/logger';
import { simplifyError } from './simplify-error';

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  const simplified = simplifyError(err);

  logger.error(`${simplified.statusCode} - ${simplified.message}`, {
    url: req.originalUrl,
    method: req.method,
    stack: err instanceof Error ? err.stack : undefined,
    errorSources: simplified.errorSources,
  });

  if (!res.headersSent) {
    const payload = errorResponse(simplified.message, {
      statusCode: simplified.statusCode,
      error: simplified.errorSources,
      ...(process.env.NODE_ENV === 'development' &&
        err instanceof Error && { stack: err.stack }),
    });
    res.status(simplified.statusCode).json(payload);
  }
};
