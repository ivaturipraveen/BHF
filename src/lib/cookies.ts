import 'server-only';
import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'bhf_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export const ADMIN_COOKIE = 'bhf_admin';
export const ADMIN_MAX_AGE_SECONDS = 60 * 60 * 8;

export const CSRF_COOKIE = 'bhf_csrf';
export const CSRF_MAX_AGE_SECONDS = ADMIN_MAX_AGE_SECONDS;

export async function setSessionCookie(token: string): Promise<void> {
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  cookies().delete(SESSION_COOKIE);
}

export async function setAdminCookie(token: string): Promise<void> {
  cookies().set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: ADMIN_MAX_AGE_SECONDS,
  });
}

export async function clearAdminCookie(): Promise<void> {
  cookies().delete(ADMIN_COOKIE);
  cookies().delete(CSRF_COOKIE);
}

export async function setCsrfCookie(token: string): Promise<void> {
  cookies().set(CSRF_COOKIE, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: CSRF_MAX_AGE_SECONDS,
  });
}
