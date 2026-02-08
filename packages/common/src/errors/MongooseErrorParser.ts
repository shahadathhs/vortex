import { ApiError, ApiErrorIdentifier } from './ApiErrors';

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

export class MongooseErrorParser {
  public static parse(err: unknown): ApiError | null {
    const error = err as MongoError;

    // Duplicate Key Error
    if (error.code === 11000 && error.keyValue) {
      const field = Object.keys(error.keyValue)[0];
      return new ApiError(
        `Duplicate value for field: ${field}`,
        409,
        ApiErrorIdentifier.CONFLICT,
      );
    }

    // Validation Error
    if (error.name === 'ValidationError') {
      const valErr = err as MongooseValidationError;
      const errors = Object.values(valErr.errors).map((el) => ({
        path: el.path,
        message: el.message,
      }));
      return new ApiError(
        'Database Validation Error',
        400,
        ApiErrorIdentifier.VALIDATION_ERROR,
        errors,
      );
    }

    // Cast Error (Invalid ID)
    if (error.name === 'CastError') {
      const castErr = err as MongooseCastError;
      return new ApiError(
        `Invalid ${castErr.path}: ${String(castErr.value)}`,
        400,
        ApiErrorIdentifier.BAD_REQUEST,
      );
    }

    return null;
  }
}
