import { NextResponse } from 'next/server';
import { clearAdminCookie } from '@/lib/cookies';

export const dynamic = 'force-dynamic';

export async function POST(): Promise<NextResponse> {
  await clearAdminCookie();
  return NextResponse.json({ ok: true }, { status: 200 });
}
