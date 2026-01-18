import { NextFunction, Request, Response } from 'express';
import { z, ZodError } from 'zod';
import { AppError } from '../errors/errorHandler';

export const validateRequest = (schema: z.ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = error.issues
          .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
          .join(', ');
        next(new AppError(errorMessage, 400));
      } else {
        next(error);
      }
    }
  };
};
