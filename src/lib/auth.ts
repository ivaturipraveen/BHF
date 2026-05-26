import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { cookies } from 'next/headers';
import { getJwtSecret } from '@/lib/jwtSecret';

// Eager validation: bail fast at boot if JWT_SECRET is misconfigured.
void getJwtSecret();

const SECRET_KEY = new TextEncoder().encode(getJwtSecret());
const ALG = 'HS256';
const ISSUER = 'bhf';
const AUDIENCE = 'bhf-app';

export const SESSION_COOKIE = 'bhf_session';

export type SessionRole = 'member' | 'admin' | 'super_admin' | 'editor' | 'contributor';

export interface SessionPayload extends JWTPayload {
  sub: string;
  role: SessionRole;
  email: string;
}

const BCRYPT_COST = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_COST);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function signSessionToken(
  payload: { sub: string; role: SessionRole; email: string },
  expiresIn: string = '7d',
): Promise<string> {
  return new SignJWT({ role: payload.role, email: payload.email })
    .setProtectedHeader({ alg: ALG })
    .setSubject(payload.sub)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY, {
      algorithms: [ALG],
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    if (
      typeof payload.sub !== 'string' ||
      typeof payload.email !== 'string' ||
      typeof payload.role !== 'string'
    ) {
      return null;
    }
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  const store = cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
