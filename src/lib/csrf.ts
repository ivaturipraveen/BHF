import 'server-only';
import { cookies } from 'next/headers';
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { CSRF_COOKIE } from '@/lib/cookies';
import { getJwtSecret } from '@/lib/jwtSecret';

function hmac(sessionId: string, nonce: string): string {
  return createHmac('sha256', getJwtSecret())
    .update(`${sessionId}.${nonce}`)
    .digest('base64url');
}

export function generateCsrfToken(sessionId: string): string {
  const nonce = randomBytes(24).toString('base64url');
  const mac = hmac(sessionId, nonce);
  return `${nonce}.${mac}`;
}

export function verifyCsrfToken(token: string | null | undefined, sessionId: string): boolean {
  if (!token || typeof token !== 'string') return false;
  const dot = token.indexOf('.');
  if (dot < 1) return false;
  const nonce = token.slice(0, dot);
  const mac = token.slice(dot + 1);
  const expected = hmac(sessionId, nonce);
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function getCsrfCookieValue(): string | null {
  return cookies().get(CSRF_COOKIE)?.value ?? null;
}

export function getCsrfHeader(headers: Headers): string | null {
  return headers.get('x-csrf-token');
}

export function verifyCsrfFromRequest(headers: Headers, sessionId: string): boolean {
  const headerToken = getCsrfHeader(headers);
  const cookieToken = getCsrfCookieValue();
  if (!headerToken || !cookieToken) return false;
  if (headerToken !== cookieToken) return false;
  return verifyCsrfToken(headerToken, sessionId);
}
