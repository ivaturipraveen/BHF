import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { requireMemberSessionOrJson } from '@/lib/session';
import { listDirectoryMembers } from '@/lib/queries/members';

export const dynamic = 'force-dynamic';

const querySchema = z.object({
  search: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export async function GET(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req.headers);
  const limited = rateLimit(ip, 'members-list', 30, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again in a minute.' },
      { status: 429 },
    );
  }

  const guard = await requireMemberSessionOrJson();
  if (!guard.ok) return guard.response;

  const url = new URL(req.url);
  const parsed = querySchema.safeParse({
    search: url.searchParams.get('search') ?? undefined,
    page: url.searchParams.get('page') ?? undefined,
    pageSize: url.searchParams.get('pageSize') ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid query.', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const result = await listDirectoryMembers(parsed.data);
    return NextResponse.json(
      {
        members: result.rows,
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error('[members/list] failed', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
