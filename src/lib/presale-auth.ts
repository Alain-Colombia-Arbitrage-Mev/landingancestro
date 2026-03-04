import jwt from 'jsonwebtoken';

const PRESALE_JWT_SECRET = import.meta.env.PRESALE_JWT_SECRET || 'presale-dev-secret-change-me';
const TOKEN_TTL = '30d';

export interface PresaleAccessPayload {
  sub: string;
  method: 'invite_code' | 'whitelist_otp';
  iat?: number;
  exp?: number;
}

export function signPresaleToken(identifier: string, method: 'invite_code' | 'whitelist_otp'): string {
  return jwt.sign(
    { sub: identifier, method } satisfies PresaleAccessPayload,
    PRESALE_JWT_SECRET,
    { expiresIn: TOKEN_TTL }
  );
}

export function verifyPresaleToken(token: string): PresaleAccessPayload | null {
  try {
    return jwt.verify(token, PRESALE_JWT_SECRET) as PresaleAccessPayload;
  } catch {
    return null;
  }
}
