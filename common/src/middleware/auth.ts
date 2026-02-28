import { NextFunction, Request, Response } from 'express';

import { verifyToken } from '../core/jwt';
import { UnauthorizedError } from '../errors/api-errors';
import { AuthUser } from '../types/auth';

/** Asserts req.user exists (use after protect). */
export const requireUser = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return next(new UnauthorizedError('Unauthorized'));
  }
  next();
};

/** Fetches user for auth check (isActive, existence). Used by auth-service. */
export type FetchUserForAuth = (
  userId: string,
) => Promise<{ isActive?: boolean } | null>;

export const protect = (
  secret: string,
  options?: { fetchUser?: FetchUserForAuth },
) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new UnauthorizedError('You are not logged in'));
    }

    try {
      const decoded = verifyToken(token, secret);
      req.user = decoded as AuthUser;

      if (options?.fetchUser) {
        const user = await options.fetchUser(decoded.id);
        if (!user) {
          return next(new UnauthorizedError('User not found'));
        }
        if (user.isActive === false) {
          return next(new UnauthorizedError('Account is inactive'));
        }
      }

      next();
    } catch {
      return next(new UnauthorizedError('Invalid token or expired'));
    }
  };
};
