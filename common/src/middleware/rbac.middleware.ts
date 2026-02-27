import { NextFunction, Request, Response } from 'express';

import { Permission, Role, RolePermissions } from '../constants/constants';
import { ForbiddenError, UnauthorizedError } from '../errors/ApiErrors';

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
