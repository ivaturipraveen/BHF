import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { adminGuard } from '@/lib/adminGuard';
import {
  createAnnualReport,
  listAllAnnualReports,
} from '@/lib/queries/admin/annualReports';

export const dynamic = 'force-dynamic';

const createSchema = z.object({
  year: z.number().int().min(1900).max(3000),
  title: z.string().max(200).nullable().optional(),
  pdf_url: z.string().url().max(2000),
  cover_image_url: z.string().url().max(2000).nullable().optional(),
  display_order: z.number().int().optional(),
});

export async function GET(req: NextRequest): Promise<NextResponse> {
  const guard = await adminGuard(req);
  if (!guard.ok) return guard.response;
  const reports = await listAllAnnualReports();
  return NextResponse.json({ reports }, { status: 200 });
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
  try {
    const report = await createAnnualReport(parsed.data);
    return NextResponse.json({ report }, { status: 201 });
  } catch (err: any) {
    if (err?.code === '23505') {
      return NextResponse.json({ error: 'Report for that year already exists.' }, { status: 409 });
    }
    console.error('[admin/annual-reports POST] failed', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
