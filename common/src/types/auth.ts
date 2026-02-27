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
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
