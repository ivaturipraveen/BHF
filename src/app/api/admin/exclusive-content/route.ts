import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { adminGuard } from '@/lib/adminGuard';
import {
  createExclusiveContent,
  listAllExclusiveContent,
} from '@/lib/queries/admin/exclusiveContent';

export const dynamic = 'force-dynamic';

const createSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().max(2000).nullable().optional(),
  category: z.enum(['yoga', 'vedic_chanting', 'bharatiyatha_lecture', 'festival_recording', 'magazine', 'other']),
  content_type: z.enum(['video', 'pdf', 'audio']),
  content_url: z.string().url().max(2000),
  thumbnail_url: z.string().url().max(2000).nullable().optional(),
  duration_seconds: z.number().int().min(0).nullable().optional(),
  published_at: z.string().datetime().nullable().optional(),
});

export async function GET(req: NextRequest): Promise<NextResponse> {
  const guard = await adminGuard(req);
  if (!guard.ok) return guard.response;
  const items = await listAllExclusiveContent();
  return NextResponse.json({ items }, { status: 200 });
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
  const item = await createExclusiveContent(parsed.data);
  return NextResponse.json({ item }, { status: 201 });
}
