import { NextFunction, Request, Response } from 'express';

import { logger } from '../utils/logger';
import { simplifyError } from './simplify-error';

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  const errorResponse = simplifyError(err);

  logger.error(`${errorResponse.statusCode} - ${errorResponse.message}`, {
    url: req.originalUrl,
    method: req.method,
    stack: err instanceof Error ? err.stack : undefined,
    errorSources: errorResponse.errorSources,
  });

  if (!res.headersSent) {
    res.status(errorResponse.statusCode).json({
      success: false,
      statusCode: errorResponse.statusCode,
      message: errorResponse.message,
      error: errorResponse.errorSources,
      ...(process.env.NODE_ENV === 'development' &&
        err instanceof Error && { stack: err.stack }),
    });
  }
};
