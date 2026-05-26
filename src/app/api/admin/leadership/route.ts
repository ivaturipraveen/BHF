import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { adminGuard } from '@/lib/adminGuard';
import { createLeadership, listAllLeadership, reorderLeadership } from '@/lib/queries/admin/leadership';

export const dynamic = 'force-dynamic';

const createSchema = z.object({
  name: z.string().trim().min(1).max(200),
  role: z.string().trim().min(1).max(200),
  bio: z.string().min(1),
  photo_url: z.string().url().max(2000).nullable().optional(),
  linkedin_url: z.string().url().max(2000).nullable().optional(),
  section: z.enum(['founding', 'board', 'working_group']),
  display_order: z.number().int().optional(),
  active: z.boolean().optional(),
});

const reorderSchema = z.object({
  reorder: z.array(z.object({ id: z.string().uuid(), display_order: z.number().int() })).min(1),
});

export async function GET(req: NextRequest): Promise<NextResponse> {
  const guard = await adminGuard(req);
  if (!guard.ok) return guard.response;
  const leadership = await listAllLeadership();
  return NextResponse.json({ leadership }, { status: 200 });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const guard = await adminGuard(req);
  if (!guard.ok) return guard.response;

  let raw: unknown;
  try { raw = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const reorderTry = reorderSchema.safeParse(raw);
  if (reorderTry.success) {
    if (guard.session.role === 'contributor') {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }
    await reorderLeadership(reorderTry.data.reorder);
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 422 });
  }
  const leader = await createLeadership(parsed.data);
  return NextResponse.json({ leader }, { status: 201 });
}
