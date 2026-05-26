import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { adminGuard } from '@/lib/adminGuard';
import { createSponsor, listAllSponsors } from '@/lib/queries/admin/sponsors';

export const dynamic = 'force-dynamic';

const createSchema = z.object({
  name: z.string().trim().min(1).max(200),
  tier: z.string().max(100).nullable().optional(),
  logo_url: z.string().url().max(2000),
  website_url: z.string().url().max(2000).nullable().optional(),
  display_order: z.number().int().optional(),
  active: z.boolean().optional(),
});

export async function GET(req: NextRequest): Promise<NextResponse> {
  const guard = await adminGuard(req);
  if (!guard.ok) return guard.response;
  const sponsors = await listAllSponsors();
  return NextResponse.json({ sponsors }, { status: 200 });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const guard = await adminGuard(req);
  if (!guard.ok) return guard.response;
  let raw: unknown;
  try { raw = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }
  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 422 });
  }
  const sponsor = await createSponsor(parsed.data);
  return NextResponse.json({ sponsor }, { status: 201 });
}
