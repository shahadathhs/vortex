import jwt from 'jsonwebtoken';

export interface TokenPayload {
  id: string;
  email: string;
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
    console.error('Error verifying token:', error);
    throw new Error('Invalid or expired token');
  }
};
