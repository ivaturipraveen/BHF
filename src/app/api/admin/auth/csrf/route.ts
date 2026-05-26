import { NextResponse } from 'next/server';
import { getAdminSessionFromCookies } from '@/lib/adminSession';
import { generateCsrfToken, getCsrfCookieValue, verifyCsrfToken } from '@/lib/csrf';
import { setCsrfCookie } from '@/lib/cookies';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }
  const existing = getCsrfCookieValue();
  if (existing && verifyCsrfToken(existing, session.sub)) {
    return NextResponse.json({ csrfToken: existing }, { status: 200 });
  }
  const token = generateCsrfToken(session.sub);
  await setCsrfCookie(token);
  return NextResponse.json({ csrfToken: token }, { status: 200 });
}
