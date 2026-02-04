import { AuthUser } from '@vortex/common';
import { NextFunction, Request, Response } from 'express';

import { authService } from '../services/auth.service';

import { LoginInput, RegisterInput } from '@/schemas/auth.schema';

interface AuthRequest extends Request {
  user?: AuthUser;
}

export class AuthController {
  public register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.register(req.body as RegisterInput);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.login(req.body as LoginInput);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  public refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { refreshToken } = req.body as { refreshToken: string };
      const result = await authService.refreshToken(refreshToken);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  public forgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { email } = req.body as { email: string };
      const result = await authService.forgotPassword(email);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  public resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { token, newPassword } = req.body as {
        token: string;
        newPassword: string;
      };
      const result = await authService.resetPassword(token, newPassword);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  public getProfile = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      const result = await authService.getProfile(userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  public logout = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      const result = await authService.logout(userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();
