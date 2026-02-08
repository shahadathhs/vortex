export enum ApiErrorIdentifier {
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

export class ApiError extends Error {
  constructor(
    public override message: string,
    public statusCode: number,
    public code: ApiErrorIdentifier = ApiErrorIdentifier.INTERNAL_SERVER_ERROR,
    public errors: any[] = [],
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends ApiError {
  constructor(message = 'Bad Request', errors: any[] = []) {
    super(message, 400, ApiErrorIdentifier.BAD_REQUEST, errors);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(message, 401, ApiErrorIdentifier.UNAUTHORIZED);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden') {
    super(message, 403, ApiErrorIdentifier.FORBIDDEN);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Not Found') {
    super(message, 404, ApiErrorIdentifier.NOT_FOUND);
  }
}

export class ConflictError extends ApiError {
  constructor(message = 'Conflict') {
    super(message, 409, ApiErrorIdentifier.CONFLICT);
  }
}

export class ValidationError extends ApiError {
  constructor(errors: any[], message = 'Validation Error') {
    super(message, 400, ApiErrorIdentifier.VALIDATION_ERROR, errors);
  }
}
