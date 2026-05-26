import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { adminGuard } from '@/lib/adminGuard';
import {
  getPageBySlug,
  updatePage,
} from '@/lib/queries/admin/pages';

export const dynamic = 'force-dynamic';

const patchSchema = z.object({
  title: z.string().trim().max(200).nullable().optional(),
  body_md: z.string().max(100000).nullable().optional(),
  meta_title: z.string().max(200).nullable().optional(),
  meta_description: z.string().max(500).nullable().optional(),
});

interface Ctx { params: { slug: string } }

export async function GET(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  const guard = await adminGuard(req);
  if (!guard.ok) return guard.response;
  const page = await getPageBySlug(params.slug);
  if (!page) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  return NextResponse.json({ page }, { status: 200 });
}

export async function PATCH(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  const guard = await adminGuard(req);
  if (!guard.ok) return guard.response;
  const { session } = guard;
  if (session.role === 'contributor') {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }
  let raw: unknown;
  try { raw = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 422 });
  }
  const page = await getPageBySlug(params.slug);
  if (!page) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  const updated = await updatePage(page.id, { ...parsed.data, updated_by: session.sub });
  return NextResponse.json({ page: updated }, { status: 200 });
}
