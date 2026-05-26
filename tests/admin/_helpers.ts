// Shared helpers for Phase 6 admin integration tests.
// All tests in this directory run in node env against the live Next.js server
// at http://localhost:3000 and a real Postgres connection.

import bcrypt from 'bcryptjs';
import { expect } from 'vitest';
import { query } from '../../src/lib/db';
import type { AdminRole } from '../../src/types/db';

export const BASE = 'http://localhost:3000';

export const DEFAULT_ADMIN_EMAIL = 'admin@bhfcommunity.org';
export const DEFAULT_ADMIN_PASSWORD = 'BhfAdmin2026!';

export function nanoid(len: number = 10): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < len; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

// TRUST_PROXY=1 is set in /home/ubuntu/.bw_env so x-forwarded-for is honored
// as the rate-limit subject. A unique synthetic IP per test avoids tripping
// the 5/min admin-login limiter and the 20/min mutation limiter.
let ipCounter = 0;
export function uniqueTestIp(): string {
  ipCounter = (ipCounter + 1) % 250;
  return `10.40.${Math.floor(Math.random() * 250)}.${ipCounter + 1}`;
}

export interface AdminCtx {
  cookies: string;          // request Cookie header (e.g. "bhf_admin=...; bhf_csrf=...")
  csrfToken: string;        // x-csrf-token value
  adminId: string;
  email: string;
  ip: string;               // pinned synthetic ip — reuse for rate-limit consistency
}

function parseAllSetCookie(res: Response): string[] {
  const anyHeaders = res.headers as unknown as {
    getSetCookie?: () => string[];
  };
  if (typeof anyHeaders.getSetCookie === 'function') {
    return anyHeaders.getSetCookie();
  }
  const single = res.headers.get('set-cookie');
  if (!single) return [];
  return single.split(/,\s*(?=[A-Za-z0-9_\-]+=)/);
}

export function findSetCookie(res: Response, name: string): string | null {
  return parseAllSetCookie(res).find((h) => h.startsWith(`${name}=`)) ?? null;
}

function cookiePair(setCookie: string): string {
  return setCookie.split(';')[0];
}

export async function adminLogin(
  email: string = DEFAULT_ADMIN_EMAIL,
  password: string = DEFAULT_ADMIN_PASSWORD,
): Promise<AdminCtx> {
  const ip = uniqueTestIp();
  const res = await fetch(`${BASE}/api/admin/auth/login`, {
    method: 'POST',
    redirect: 'manual',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': ip,
    },
    body: JSON.stringify({ email, password }),
  });
  if (res.status !== 200) {
    const body = await res.text();
    throw new Error(`adminLogin failed: ${res.status} ${body}`);
  }
  const admin = findSetCookie(res, 'bhf_admin');
  const csrf = findSetCookie(res, 'bhf_csrf');
  if (!admin || !csrf) {
    throw new Error('adminLogin missing Set-Cookie for bhf_admin / bhf_csrf');
  }
  const cookies = `${cookiePair(admin)}; ${cookiePair(csrf)}`;
  const json = (await res.json()) as {
    csrfToken: string;
    admin: { id: string; email: string };
  };
  return {
    cookies,
    csrfToken: json.csrfToken,
    adminId: json.admin.id,
    email: json.admin.email,
    ip,
  };
}

const MUTATION_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

export interface AdminFetchInit extends Omit<RequestInit, 'headers'> {
  headers?: Record<string, string>;
  // when set, do NOT auto-attach x-csrf-token even on a mutation method
  skipCsrf?: boolean;
  // override the csrf header value explicitly (truthy => attach this value)
  csrfOverride?: string;
}

export async function adminFetch(
  path: string,
  init: AdminFetchInit | undefined,
  ctx: AdminCtx,
): Promise<Response> {
  const method = (init?.method ?? 'GET').toUpperCase();
  const headers: Record<string, string> = {
    cookie: ctx.cookies,
    'x-forwarded-for': ctx.ip,
    ...(init?.headers ?? {}),
  };
  if (
    init?.body &&
    typeof init.body === 'string' &&
    !headers['content-type'] &&
    !headers['Content-Type']
  ) {
    headers['Content-Type'] = 'application/json';
  }
  if (MUTATION_METHODS.has(method)) {
    if (init?.csrfOverride !== undefined) {
      headers['x-csrf-token'] = init.csrfOverride;
    } else if (!init?.skipCsrf) {
      headers['x-csrf-token'] = ctx.csrfToken;
    }
  }
  return fetch(`${BASE}${path}`, {
    method,
    redirect: 'manual',
    ...init,
    headers,
  });
}

export interface ThrowawayAdmin {
  id: string;
  email: string;
  password: string;
  cleanup: () => Promise<void>;
}

export async function createThrowawayAdmin(role: AdminRole): Promise<ThrowawayAdmin> {
  const email = `qa-admin-${role}-${nanoid(8)}@test.local`;
  const password = `QaPass${nanoid(6)}!1A`;
  const hash = await bcrypt.hash(password, 10);
  const rows = await query<{ id: string }>(
    `INSERT INTO admins (email, password_hash, name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
    [email, hash, `QA ${role}`, role],
  );
  const id = rows[0].id;
  return {
    id,
    email,
    password,
    cleanup: async () => {
      await query(`DELETE FROM admins WHERE id = $1`, [id]);
    },
  };
}

export function assertCloseToNow(ts: string | Date | null | undefined, toleranceMs = 30_000): void {
  if (!ts) {
    throw new Error('assertCloseToNow: timestamp is null/undefined');
  }
  const t = typeof ts === 'string' ? new Date(ts).getTime() : ts.getTime();
  const delta = Math.abs(Date.now() - t);
  expect(delta, `expected ${ts} to be within ${toleranceMs}ms of now (delta=${delta}ms)`).toBeLessThan(
    toleranceMs,
  );
}

export async function ensureServerReachable(): Promise<void> {
  const res = await fetch(BASE);
  if (!res.ok) {
    throw new Error(`Next.js server at ${BASE} responded ${res.status}`);
  }
}
