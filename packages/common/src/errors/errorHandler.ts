import { NextFunction, Request, Response } from 'express';

import { logger } from '../utils/logger';
import { ApiError } from './ApiErrors';
import { MongooseErrorParser } from './MongooseErrorParser';

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  let error = err;

  // Parse Mongoose Errors
  const mongooseError = MongooseErrorParser.parse(err);
  if (mongooseError) {
    error = mongooseError;
  }

  const statusCode = error instanceof ApiError ? error.statusCode : 500;
  const message =
    error instanceof Error ? error.message : 'Internal Server Error';
  const code = error instanceof ApiError ? error.code : 'INTERNAL_SERVER_ERROR';
  const errors = error instanceof ApiError ? error.errors : [];
  const stack = error instanceof Error ? error.stack : undefined;

  logger.error(`${statusCode} - ${message}`, {
    url: req.originalUrl,
    method: req.method,
    stack,
    code,
    errors,
  });

  res.status(statusCode).json({
    status: 'error',
    code,
    message,
    ...(errors.length > 0 && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack }),
  });
};
