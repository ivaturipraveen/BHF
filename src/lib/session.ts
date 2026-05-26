import 'server-only';
import { NextResponse } from 'next/server';
import { getSessionFromCookies, type SessionPayload } from '@/lib/auth';

export type MemberSessionPayload = SessionPayload & { role: 'member' };

export async function requireMemberSession(): Promise<MemberSessionPayload | null> {
  const session = await getSessionFromCookies();
  if (!session || session.role !== 'member') {
    return null;
  }
  return session as MemberSessionPayload;
}

export type RequireMemberSessionResult =
  | { ok: true; session: MemberSessionPayload }
  | { ok: false; response: NextResponse };

export async function requireMemberSessionOrJson(): Promise<RequireMemberSessionResult> {
  const session = await requireMemberSession();
  if (!session) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Authentication required.' },
        { status: 401 },
      ),
    };
  }
  return { ok: true, session };
}
