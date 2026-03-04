import { Response } from 'express';

import { HttpStatusCode } from '../constants/http-status';

/**
 * Standardized API response utilities
 */

export interface TResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface TPaginatedResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T[];
  metadata: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
}

/** Send standardized response with status code */
export const sendResponse = <T>(
  res: Response,
  options: {
    statusCode?: number;
    success?: boolean;
    message: string;
    data?: T;
  },
) => {
  const {
    statusCode = HttpStatusCode.OK,
    success = true,
    message,
    data,
  } = options;
  res.status(statusCode).json({
    statusCode,
    success,
    message,
    ...(data !== undefined && { data }),
  });
};

export const successResponse = <T>(
  data: T,
  message = 'Request successful',
): TResponse<T> => ({
  success: true,
  message,
  data,
});

export const successPaginatedResponse = <T>(
  data: T[],
  metadata: {
    page: number;
    limit: number;
    total: number;
  },
  message = 'Request successful',
): TPaginatedResponse<T> => ({
  success: true,
  message,
  data,
  metadata: {
    page: metadata.page,
    limit: metadata.limit,
    total: metadata.total,
    totalPage: Math.ceil(metadata.total / metadata.limit),
  },
});

export interface TErrorResponse<T = unknown> {
  success: false;
  message: string;
  data?: T;
}

/** Consistent error payload shape */
export const errorResponse = <T>(
  message: string,
  data?: T,
): TErrorResponse<T> => ({
  success: false,
  message,
  ...(data !== undefined && { data }),
});

/** Send paginated response and set status */
export const sendPaginatedResponse = <T>(
  res: Response,
  data: T[],
  metadata: { page: number; limit: number; total: number },
  message = 'Request successful',
  statusCode = 200,
) => {
  res
    .status(statusCode)
    .json(successPaginatedResponse(data, metadata, message));
};
