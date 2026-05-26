import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { emailSchema } from '@/lib/validation';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

const photoSubmissionBodySchema = z.object({
  eventSlug: z.string().trim().min(1).max(200).optional(),
  submitterName: z.string().trim().min(1).max(200),
  submitterEmail: emailSchema,
  fileUrl: z.string().url().max(2000),
  caption: z.string().trim().max(2000).optional(),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req.headers);
  const limited = rateLimit(ip, 'photo-submissions', 3, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again in a minute.' },
      { status: 429 },
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = photoSubmissionBodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request.', details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { eventSlug, submitterName, submitterEmail, fileUrl, caption } = parsed.data;

  let eventId: string | null = null;
  if (eventSlug) {
    try {
      const rows = await query<{ id: string }>(
        `SELECT id FROM events WHERE slug = $1 LIMIT 1`,
        [eventSlug],
      );
      if (rows.length > 0) {
        eventId = rows[0].id;
      }
    } catch (err) {
      console.error('[photo-submissions] event lookup failed', err);
      return NextResponse.json({ error: 'Server error.' }, { status: 500 });
    }
  }

  try {
    const rows = await query<{ id: string }>(
      `INSERT INTO photo_submissions (
         submitter_name, submitter_email, event_id, file_url, caption, status
       ) VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING id`,
      [
        submitterName,
        submitterEmail,
        eventId,
        fileUrl,
        caption && caption.trim() !== '' ? caption : null,
      ],
    );
    return NextResponse.json({ id: rows[0].id }, { status: 201 });
  } catch (err) {
    console.error('[photo-submissions] insert failed', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
