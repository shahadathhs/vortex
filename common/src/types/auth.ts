import type { Request } from 'express';

export interface AuthUser {
  id: string;
  email: string;
  role: 'superadmin' | 'admin' | 'vendor' | 'customer';
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
