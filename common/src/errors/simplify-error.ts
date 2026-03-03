import { ZodError, ZodIssue } from 'zod';

import { ApiError } from './api-errors';
import { MongooseErrorParser } from './mongoose-error-parser';
import type { IErrorResponse, IErrorSource } from './error-types';

function handleZodError(err: ZodError): IErrorResponse {
  const errorSources: IErrorSource[] = err.issues.map((issue: ZodIssue) => {
    const lastPath = issue?.path?.[issue.path.length - 1];
    const path =
      typeof lastPath === 'string' || typeof lastPath === 'number'
        ? lastPath
        : String(lastPath ?? '');
    return { path, message: issue.message };
  });

  return {
    statusCode: 400,
    message: 'Validation Error. Enter valid data.',
    errorSources,
  };
}

/**
 * Normalizes any error into a consistent IErrorResponse format.
 * Handles Zod, Mongoose, ApiError, and generic Error.
 */
export function simplifyError(err: unknown): IErrorResponse {
  const defaultResponse: IErrorResponse = {
    statusCode: 500,
    message: 'Something went wrong!',
    errorSources: [{ path: '', message: 'Something went wrong' }],
  };

  if (err instanceof ZodError) {
    return handleZodError(err);
  }

  const mongooseError = MongooseErrorParser.parse(err);
  if (mongooseError) {
    const sources: IErrorSource[] =
      mongooseError.errors?.length > 0
        ? (mongooseError.errors as IErrorSource[])
        : [{ path: '', message: mongooseError.message }];
    return {
      statusCode: mongooseError.statusCode,
      message: mongooseError.message,
      errorSources: sources,
    };
  }

  if (err instanceof ApiError) {
    const sources: IErrorSource[] =
      err.errors?.length > 0
        ? (err.errors as IErrorSource[])
        : [{ path: '', message: err.message }];
    return {
      statusCode: err.statusCode,
      message: err.message,
      errorSources: sources,
    };
  }

  if (err instanceof Error) {
    return {
      ...defaultResponse,
      message: err.message,
      errorSources: [{ path: '', message: err.message }],
    };
  }

  return defaultResponse;
}
