import { AuthRequest, HttpStatusCode, sendResponse } from '@vortex/common';
import { Request, Response } from 'express';

import { authService } from '../services/auth.service';

import {
  LoginInput,
  RegisterInput,
  UpdatePasswordInput,
  UpdateProfileInput,
} from '@/schemas/auth.schema';

async function register(req: Request, res: Response) {
  const result = await authService.register(req.body as RegisterInput);
  sendResponse(res, {
    statusCode: HttpStatusCode.CREATED,
    message: 'User registered successfully',
    data: result,
  });
}

async function login(req: Request, res: Response) {
  const result = await authService.login(req.body as LoginInput);
  sendResponse(res, {
    statusCode: HttpStatusCode.OK,
    message: 'Logged in successfully',
    data: result,
  });
}

async function refreshToken(req: Request, res: Response) {
  const { refreshToken } = req.body as { refreshToken: string };
  const result = await authService.refreshToken(refreshToken);
  sendResponse(res, {
    statusCode: HttpStatusCode.OK,
    message: 'Token refreshed',
    data: result,
  });
}

async function getProfile(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) {
    sendResponse(res, {
      statusCode: HttpStatusCode.UNAUTHORIZED,
      message: 'Unauthorized',
    });
    return;
  }
  const result = await authService.getProfile(userId);
  sendResponse(res, {
    statusCode: HttpStatusCode.OK,
    message: 'Profile retrieved',
    data: result,
  });
}

async function updateProfile(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) {
    sendResponse(res, {
      statusCode: HttpStatusCode.UNAUTHORIZED,
      message: 'Unauthorized',
    });
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
}

async function updatePassword(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) {
    sendResponse(res, {
      statusCode: HttpStatusCode.UNAUTHORIZED,
      message: 'Unauthorized',
    });
    return;
  }
  const { currentPassword, newPassword } =
    req.body as unknown as UpdatePasswordInput;
  await authService.updatePassword(userId, currentPassword, newPassword);
  sendResponse(res, {
    statusCode: HttpStatusCode.OK,
    message: 'Password updated successfully',
  });
}

async function logout(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) {
    sendResponse(res, {
      statusCode: HttpStatusCode.UNAUTHORIZED,
      message: 'Unauthorized',
    });
    return;
  }
  const result = await authService.logout(userId);
  sendResponse(res, {
    statusCode: HttpStatusCode.OK,
    message: 'Logged out successfully',
    data: result,
  });
}

async function createAdmin(req: Request, res: Response) {
  const result = await authService.createAdmin(req.body);
  sendResponse(res, {
    statusCode: HttpStatusCode.CREATED,
    message: 'Admin created successfully',
    data: result,
  });
}

async function deleteAdmin(req: Request, res: Response) {
  const result = await authService.deleteAdmin(String(req.params.id ?? ''));
  sendResponse(res, {
    statusCode: HttpStatusCode.OK,
    message: 'Admin deleted successfully',
    data: result,
  });
}

async function listAdmins(req: Request, res: Response) {
  const result = await authService.listAdmins();
  sendResponse(res, {
    statusCode: HttpStatusCode.OK,
    message: 'Admins retrieved',
    data: result,
  });
}

async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body as { email: string };
  const result = await authService.forgotPassword(email);
  sendResponse(res, {
    statusCode: HttpStatusCode.OK,
    message: result.message,
    data: result,
  });
}

async function resetPassword(req: Request, res: Response) {
  const { token, newPassword } = req.body as {
    token: string;
    newPassword: string;
  };
  const result = await authService.resetPasswordWithToken(token, newPassword);
  sendResponse(res, {
    statusCode: HttpStatusCode.OK,
    message: result.message,
    data: result,
  });
}

async function resetUserPassword(req: Request, res: Response) {
  const { userId, newPassword } = req.body;
  const result = await authService.resetUserPassword(userId, newPassword);
  sendResponse(res, {
    statusCode: HttpStatusCode.OK,
    message: 'Password reset successfully',
    data: result,
  });
}

export const authController = {
  register,
  login,
  refreshToken,
  getProfile,
  updateProfile,
  updatePassword,
  logout,
  forgotPassword,
  resetPassword,
  createAdmin,
  deleteAdmin,
  listAdmins,
  resetUserPassword,
};
