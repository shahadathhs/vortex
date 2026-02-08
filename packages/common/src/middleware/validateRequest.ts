import { NextFunction, Request, Response } from 'express';
import { z, ZodError } from 'zod';

import { BadRequestError } from '../errors/ApiErrors';

export const validateRequest = (schema: z.ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body as unknown,
        query: req.query as unknown,
        params: req.params as unknown,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = error.issues
          .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
          .join(', ');
        next(new BadRequestError(errorMessage));
      } else {
        next(error);
      }
    }
  };
};
