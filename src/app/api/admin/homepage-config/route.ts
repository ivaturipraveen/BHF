import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { adminGuard } from '@/lib/adminGuard';
import {
  getHomepageConfig,
  updateHomepageConfig,
} from '@/lib/queries/admin/homepageConfig';

export const dynamic = 'force-dynamic';

const patchSchema = z.object({
  featured_event_ids: z.array(z.string().uuid()).nullable().optional(),
  featured_program_ids: z.array(z.string().uuid()).nullable().optional(),
  hero_image_url: z.string().url().max(2000).nullable().optional(),
  stat_families_served: z.number().int().min(0).optional(),
  stat_festivals_hosted: z.number().int().min(0).optional(),
  stat_youth_in_programs: z.number().int().min(0).optional(),
  stat_seva_hours: z.number().int().min(0).optional(),
});

export async function GET(req: NextRequest): Promise<NextResponse> {
  const guard = await adminGuard(req);
  if (!guard.ok) return guard.response;
  const config = await getHomepageConfig();
  return NextResponse.json({ config }, { status: 200 });
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
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
  const config = await updateHomepageConfig(parsed.data);
  return NextResponse.json({ config }, { status: 200 });
}
