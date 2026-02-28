import {
  AuthRequest,
  HttpStatusCode,
  sendResponse,
  successResponse,
} from '@vortex/common';
import { Request, Response } from 'express';

import { authService } from '../services/auth.service';

import {
  LoginInput,
  RegisterInput,
  UpdatePasswordInput,
  UpdateProfileInput,
} from '@/schemas/auth.schema';

export class AuthController {
  public register = async (req: Request, res: Response) => {
    const result = await authService.register(req.body as RegisterInput);
    sendResponse(res, {
      statusCode: HttpStatusCode.CREATED,
      message: 'User registered successfully',
      data: result,
    });
  };

  public login = async (req: Request, res: Response) => {
    const result = await authService.login(req.body as LoginInput);
    res.json(successResponse(result, 'Logged in successfully'));
  };

  public refreshToken = async (req: Request, res: Response) => {
    const { refreshToken } = req.body as { refreshToken: string };
    const result = await authService.refreshToken(refreshToken);
    res.json(successResponse(result, 'Token refreshed'));
  };

  public getProfile = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const result = await authService.getProfile(userId);
    sendResponse(res, {
      message: 'Profile retrieved',
      data: result,
    });
  };

  public updateProfile = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const result = await authService.updateProfile(
      userId,
      req.body as UpdateProfileInput,
    );
    sendResponse(res, {
      message: 'Profile updated successfully',
      data: result,
    });
  };

  public updatePassword = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const { currentPassword, newPassword } =
      req.body as unknown as UpdatePasswordInput;
    await authService.updatePassword(userId, currentPassword, newPassword);
    sendResponse(res, {
      message: 'Password updated successfully',
    });
  };

  public logout = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const result = await authService.logout(userId);
    res.json(successResponse(result, 'Logged out successfully'));
  };

  public createAdmin = async (req: Request, res: Response) => {
    const result = await authService.createAdmin(req.body);
    sendResponse(res, {
      statusCode: HttpStatusCode.CREATED,
      message: 'Admin created successfully',
      data: result,
    });
  };

  public deleteAdmin = async (req: Request, res: Response) => {
    const result = await authService.deleteAdmin(String(req.params.id ?? ''));
    res.json(successResponse(result, 'Admin deleted successfully'));
  };

  public listAdmins = async (req: Request, res: Response) => {
    const result = await authService.listAdmins();
    res.json(successResponse(result, 'Admins retrieved'));
  };

  public resetUserPassword = async (req: Request, res: Response) => {
    const { userId, newPassword } = req.body;
    const result = await authService.resetUserPassword(userId, newPassword);
    res.json(successResponse(result, 'Password reset successfully'));
  };
}

export const authController = new AuthController();
