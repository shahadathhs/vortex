import type { IErrorSource } from './error-types';
import { ApiError, ApiErrorIdentifier } from './api-errors';

interface MongoError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
}

interface MongooseValidationError extends Error {
  errors: Record<string, { path: string; message: string }>;
}

interface MongooseCastError extends Error {
  path: string;
  value: unknown;
}

/** MongoDB driver error codes (from RAG handle-error.simplify) */
const MONGODB_ERROR_CODES: Record<number, { status: number; message: string }> =
  {
    11000: { status: 409, message: 'Duplicate value error.' },
    121: { status: 400, message: 'Document validation failed.' },
    11600: { status: 500, message: 'Operation was interrupted.' },
    13: { status: 401, message: 'Database authorization failed.' },
    18: { status: 401, message: 'Database authentication failed.' },
    50: { status: 500, message: 'Operation timed out.' },
  };

export class MongooseErrorParser {
  public static parse(err: unknown): ApiError | null {
    const error = err as MongoError;

    // MongoDB driver errors (code property)
    if ('code' in error && typeof error.code === 'number') {
      const mapped = MONGODB_ERROR_CODES[error.code];
      if (mapped) {
        if (error.code === 11000 && error.keyValue) {
          // Duplicate key - use detailed message
          const field = Object.keys(error.keyValue)[0];
          const value = error.keyValue[field];
          return new ApiError(
            `The value '${String(value)}' already exists for the field '${field}'.`,
            409,
            ApiErrorIdentifier.CONFLICT,
            [{ path: field ?? 'unknown', message: 'Duplicate value' }],
          );
        }
        const code =
          mapped.status === 409
            ? ApiErrorIdentifier.CONFLICT
            : mapped.status === 400
              ? ApiErrorIdentifier.BAD_REQUEST
              : mapped.status === 401
                ? ApiErrorIdentifier.UNAUTHORIZED
                : ApiErrorIdentifier.INTERNAL_SERVER_ERROR;
        return new ApiError(
          error.message || mapped.message,
          mapped.status,
          code,
        );
      }
    }

    // Validation Error
    if (error.name === 'ValidationError') {
      const valErr = err as MongooseValidationError;
      const errorSources: IErrorSource[] = Object.values(valErr.errors).map(
        (el) => ({
          path: el.path,
          message: el.message,
        }),
      );
      return new ApiError(
        'Validation Error',
        400,
        ApiErrorIdentifier.VALIDATION_ERROR,
        errorSources,
      );
    }

    // Cast Error (Invalid ID)
    if (error.name === 'CastError') {
      const castErr = err as MongooseCastError;
      const errorSources: IErrorSource[] = [
        {
          path: castErr.path,
          message: `Invalid value '${String(castErr.value)}' for the field '${castErr.path}'.`,
        },
      ];
      return new ApiError(
        'Invalid input data.',
        400,
        ApiErrorIdentifier.BAD_REQUEST,
        errorSources,
      );
    }

    return null;
  }
}
