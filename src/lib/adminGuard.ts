import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { requireAdminSessionOrJson, type AdminSessionPayload } from '@/lib/adminSession';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { verifyCsrfFromRequest } from '@/lib/csrf';
import type { AdminRole } from '@/types/db';

export type AdminGuardResult =
  | { ok: true; session: AdminSessionPayload }
  | { ok: false; response: NextResponse };

export interface AdminGuardOpts {
  roles?: AdminRole[];
  rateLimitKey?: string;
  rateLimitMax?: number;
  rateLimitWindowMs?: number;
  requireCsrf?: boolean;
}

const MUTATION_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

export async function adminGuard(
  req: NextRequest,
  opts: AdminGuardOpts = {},
): Promise<AdminGuardResult> {
  const isMutation = MUTATION_METHODS.has(req.method);
  const limit = opts.rateLimitMax ?? (isMutation ? 20 : 60);
  const windowMs = opts.rateLimitWindowMs ?? 60_000;
  const key = opts.rateLimitKey ?? `admin:${req.method}:${new URL(req.url).pathname}`;

  const ip = getClientIp(req.headers);
  const rl = rateLimit(ip, key, limit, windowMs);
  if (!rl.ok) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Too many requests. Please try again in a minute.' },
        { status: 429 },
      ),
    };
  }

  const auth = await requireAdminSessionOrJson(opts.roles);
  if (!auth.ok) return auth;

  const needsCsrf = opts.requireCsrf ?? isMutation;
  if (needsCsrf) {
    if (!verifyCsrfFromRequest(req.headers, auth.session.sub)) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: 'Invalid CSRF token.' },
          { status: 403 },
        ),
      };
    }
  }

  return { ok: true, session: auth.session };
}
