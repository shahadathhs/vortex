import {
  AuthRequest,
  HttpStatusCode,
  publishActivity,
  sendResponse,
} from '@vortex/common';
import { Request, Response } from 'express';

import { config } from '../config/config';
import { authService } from '../services/auth.service';

import {
  LoginInput,
  RegisterInput,
  UpdatePasswordInput,
  UpdateProfileInput,
} from '@/schemas/auth.schema';

function getReqMeta(req: Request) {
  return {
    ip: req.ip ?? req.socket?.remoteAddress,
    userAgent: req.get('user-agent'),
  };
}

async function register(req: Request, res: Response) {
  const result = await authService.register(req.body as RegisterInput);
  const user = result.user as { id: string; email: string; role: string };
  await publishActivity(config.RABBITMQ_URL, {
    actorId: user.id,
    actorRole: user.role,
    actorEmail: user.email,
    action: 'user.registered',
    resource: 'user',
    resourceId: user.id,
    metadata: { email: user.email },
    ...getReqMeta(req),
  });
  sendResponse(res, {
    statusCode: HttpStatusCode.CREATED,
    message: 'User registered successfully',
    data: result,
  });
}

async function login(req: Request, res: Response) {
  const result = await authService.login(req.body as LoginInput);
  if ((result as { requiresTfa?: boolean }).requiresTfa) {
    sendResponse(res, {
      statusCode: HttpStatusCode.OK,
      message: 'OTP sent to your email',
      data: result,
    });
    return;
  }
  const user = result.user as { id: string; email: string; role: string };
  await publishActivity(config.RABBITMQ_URL, {
    actorId: user.id,
    actorRole: user.role,
    actorEmail: user.email,
    action: 'user.logged_in',
    resource: 'user',
    resourceId: user.id,
    ...getReqMeta(req),
  });
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

async function createSeller(req: AuthRequest, res: Response) {
  const result = await authService.createSeller(req.body);
  const created = result.user as { id: string; email: string };
  await publishActivity(config.RABBITMQ_URL, {
    actorId: req.user!.id,
    actorRole: req.user!.role,
    actorEmail: req.user!.email,
    action: 'seller.created',
    resource: 'user',
    resourceId: created.id,
    metadata: { sellerEmail: created.email },
    ...getReqMeta(req),
  });
  sendResponse(res, {
    statusCode: HttpStatusCode.CREATED,
    message: 'Seller created successfully',
    data: result,
  });
}

async function deleteSeller(req: AuthRequest, res: Response) {
  const sellerId = String(req.params.id ?? '');
  const result = await authService.deleteSeller(sellerId);
  await publishActivity(config.RABBITMQ_URL, {
    actorId: req.user!.id,
    actorRole: req.user!.role,
    actorEmail: req.user!.email,
    action: 'seller.deleted',
    resource: 'user',
    resourceId: sellerId,
    ...getReqMeta(req),
  });
  sendResponse(res, {
    statusCode: HttpStatusCode.OK,
    message: 'Seller deleted successfully',
    data: result,
  });
}

async function listSellers(req: Request, res: Response) {
  const result = await authService.listSellers();
  sendResponse(res, {
    statusCode: HttpStatusCode.OK,
    message: 'Sellers retrieved',
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

async function enableTfa(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) {
    sendResponse(res, {
      statusCode: HttpStatusCode.UNAUTHORIZED,
      message: 'Unauthorized',
    });
    return;
  }
  const result = await authService.enableTfa(userId);
  sendResponse(res, {
    statusCode: HttpStatusCode.OK,
    message: result.message,
    data: result,
  });
}

async function verifyTfaEnable(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) {
    sendResponse(res, {
      statusCode: HttpStatusCode.UNAUTHORIZED,
      message: 'Unauthorized',
    });
    return;
  }
  const { otp } = req.body as { otp: string };
  const result = await authService.verifyTfaEnable(userId, otp);
  sendResponse(res, {
    statusCode: HttpStatusCode.OK,
    message: result.message,
    data: result,
  });
}

async function verifyTfaLogin(req: Request, res: Response) {
  const { tfaToken, otp } = req.body as { tfaToken: string; otp: string };
  const result = await authService.verifyTfaLogin(tfaToken, otp);
  const user = result.user as { id: string; email: string; role: string };
  await publishActivity(config.RABBITMQ_URL, {
    actorId: user.id,
    actorRole: user.role,
    actorEmail: user.email,
    action: 'user.logged_in',
    resource: 'user',
    resourceId: user.id,
    ...getReqMeta(req),
  });
  sendResponse(res, {
    statusCode: HttpStatusCode.OK,
    message: 'Logged in successfully',
    data: result,
  });
}

async function disableTfa(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) {
    sendResponse(res, {
      statusCode: HttpStatusCode.UNAUTHORIZED,
      message: 'Unauthorized',
    });
    return;
  }
  const { password } = req.body as { password: string };
  const result = await authService.disableTfa(userId, password);
  sendResponse(res, {
    statusCode: HttpStatusCode.OK,
    message: result.message,
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
  enableTfa,
  verifyTfaEnable,
  verifyTfaLogin,
  disableTfa,
  createSeller,
  deleteSeller,
  listSellers,
  resetUserPassword,
};
