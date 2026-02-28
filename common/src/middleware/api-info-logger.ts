import { Request, Response, NextFunction } from 'express';

import { logger } from '../utils/logger';

/** Request/response logging middleware (barisathi-server apiInfoLogger style) */
export const apiInfoLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl, ip } = req;
    const { statusCode } = res;
    logger.http(
      `${method} ${originalUrl} ${statusCode} - ${duration}ms - ${ip ?? 'unknown'}`,
    );
  });

  next();
};
