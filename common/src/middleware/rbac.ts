import { NextFunction, Request, Response } from 'express';

import { Permission, Role, RolePermissions } from '../constants';
import { ForbiddenError, UnauthorizedError } from '../errors/api-errors';

export const checkPermission = (permission: Permission) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return next(new UnauthorizedError());
    }

    const { role } = user;
    const permissions = RolePermissions[role as Role] || [];

    if (!permissions.includes(permission)) {
      return next(
        new ForbiddenError(
          `You do not have permission to perform this action: ${permission}`,
        ),
      );
    }

    next();
  };
};

export const checkAnyPermission = (permissions: Permission[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return next(new UnauthorizedError());
    }

    const { role } = user;
    const userPermissions = RolePermissions[role as Role] || [];

    const hasAny = permissions.some((p) => userPermissions.includes(p));
    if (!hasAny) {
      return next(
        new ForbiddenError(
          `You do not have permission to perform this action. Required one of: ${permissions.join(', ')}`,
        ),
      );
    }

    next();
  };
};
