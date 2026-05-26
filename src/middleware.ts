import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { getJwtSecret } from '@/lib/jwtSecret';

const SESSION_COOKIE = 'bhf_session';
const ADMIN_COOKIE = 'bhf_admin';
const ALG = 'HS256';
const ISSUER = 'bhf';
const AUDIENCE = 'bhf-app';

const ADMIN_ROLES = new Set(['super_admin', 'editor', 'contributor']);
const MEMBER_ROLES = new Set(['member']);

function getKey(): Uint8Array {
  return new TextEncoder().encode(getJwtSecret());
}

async function verify(token: string): Promise<{ role?: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getKey(), {
      algorithms: [ALG],
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    return payload as { role?: string };
  } catch {
    return null;
  }
}

function withPathnameHeader(res: NextResponse, pathname: string): NextResponse {
  res.headers.set('x-pathname', pathname);
  return res;
}

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login' || pathname.startsWith('/admin/login/')) {
      return withPathnameHeader(NextResponse.next(), pathname);
    }
    const adminToken = req.cookies.get(ADMIN_COOKIE)?.value;
    const adminPayload = adminToken ? await verify(adminToken) : null;
    if (!adminPayload || !adminPayload.role || !ADMIN_ROLES.has(adminPayload.role)) {
      const url = req.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
    return withPathnameHeader(NextResponse.next(), pathname);
  }

  if (pathname.startsWith('/account')) {
    const memberToken = req.cookies.get(SESSION_COOKIE)?.value;
    const memberPayload = memberToken ? await verify(memberToken) : null;
    if (!memberPayload || !memberPayload.role || !MEMBER_ROLES.has(memberPayload.role)) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
    return withPathnameHeader(NextResponse.next(), pathname);
  }

  return withPathnameHeader(NextResponse.next(), pathname);
}

// The matcher runs middleware on every path (excluding Next's internal assets)
// so that root layout can read `x-pathname` to decide whether to render
// privacy-sensitive scripts like Plausible on admin routes.
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
};
