import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import { verifySessionToken, type SessionPayload } from '@/lib/auth';
import { ADMIN_COOKIE } from '@/lib/cookies';
import type { AdminRole } from '@/types/db';

export type AdminSessionPayload = SessionPayload & { role: AdminRole };

const ADMIN_ROLES: ReadonlySet<AdminRole> = new Set([
  'super_admin',
  'editor',
  'contributor',
]);

function isAdminRole(role: unknown): role is AdminRole {
  return typeof role === 'string' && ADMIN_ROLES.has(role as AdminRole);
}

export async function getAdminSessionFromCookies(): Promise<AdminSessionPayload | null> {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifySessionToken(token);
  if (!payload) return null;
  if (!isAdminRole(payload.role)) return null;
  return payload as AdminSessionPayload;
}

export type RequireAdminSessionResult =
  | { ok: true; session: AdminSessionPayload }
  | { ok: false; response: NextResponse };

export async function requireAdminSessionOrJson(
  roles?: AdminRole[],
): Promise<RequireAdminSessionResult> {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Authentication required.' },
        { status: 401 },
      ),
    };
  }
  if (roles && roles.length > 0 && !roles.includes(session.role)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Forbidden.' },
        { status: 403 },
      ),
    };
  }
  return { ok: true, session };
}

export async function requireAdminPageSession(
  roles?: AdminRole[],
  nextPath?: string,
): Promise<AdminSessionPayload> {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    const next = nextPath ? `?next=${encodeURIComponent(nextPath)}` : '';
    redirect(`/admin/login${next}`);
  }
  if (roles && roles.length > 0 && !roles.includes(session.role)) {
    redirect('/admin?denied=1');
  }
  return session;
}

export function canCreate(role: AdminRole): boolean {
  return role === 'super_admin' || role === 'editor' || role === 'contributor';
}

export function canPublish(role: AdminRole): boolean {
  return role === 'super_admin' || role === 'editor';
}

export function canApprove(role: AdminRole): boolean {
  return role === 'super_admin' || role === 'editor';
}

export function canManageMembers(role: AdminRole): boolean {
  return role === 'super_admin';
}

export function canManageAdmins(role: AdminRole): boolean {
  return role === 'super_admin';
}

export function canDelete(role: AdminRole): boolean {
  return role === 'super_admin' || role === 'editor';
}

export function canEditOthers(role: AdminRole): boolean {
  return role === 'super_admin' || role === 'editor';
}
