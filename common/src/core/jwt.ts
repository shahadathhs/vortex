import jwt from 'jsonwebtoken';

import { logger } from '../utils/logger';

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

export const generateToken = (
  payload: TokenPayload,
  secret: string,
): string => {
  return jwt.sign(payload, secret, { expiresIn: '1d' });
};

export const verifyToken = (token: string, secret: string): TokenPayload => {
  try {
    return jwt.verify(token, secret) as TokenPayload;
  } catch (error) {
    logger.error(`Error verifying token: ${String(error)}`);
    // Preserving the cause is required by the preserve-caught-error rule
    const err = new Error('Invalid or expired token');
    (err as Error & { cause?: unknown }).cause = error;
    throw err;
  }
};
