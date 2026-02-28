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

  public createAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await authService.createAdmin(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  public deleteAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await authService.deleteAdmin(String(req.params.id ?? ''));
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  public listAdmins = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await authService.listAdmins();
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  public resetUserPassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { userId, newPassword } = req.body;
      const result = await authService.resetUserPassword(userId, newPassword);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();
