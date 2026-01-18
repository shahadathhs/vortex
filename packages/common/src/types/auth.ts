export interface AuthUser {
  id: string;
  email: string;
  role: 'customer' | 'admin' | 'vendor';
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
