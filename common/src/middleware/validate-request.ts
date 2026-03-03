import { NextFunction, Request, Response } from 'express';
import { z, ZodError } from 'zod';

import { ValidationError } from '../errors/api-errors';
import type { IErrorSource } from '../errors/error-types';

export const validateRequest = (schema: z.ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body as unknown,
        query: req.query as unknown,
        params: req.params as unknown,
        cookies: (req.cookies ?? {}) as unknown,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorSources: IErrorSource[] = error.issues.map((issue) => {
          const lastPath = issue?.path?.[issue.path.length - 1];
          const path =
            typeof lastPath === 'string' || typeof lastPath === 'number'
              ? lastPath
              : String(lastPath ?? '');
          return { path, message: issue.message };
        });
        next(
          new ValidationError(
            errorSources,
            'Validation Error. Enter valid data.',
          ),
        );
      } else {
        next(error);
      }
    }
  };
};
