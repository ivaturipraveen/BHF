import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { emailSchema } from '@/lib/validation';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

const contactBodySchema = z.object({
  type: z.enum(['volunteer', 'sponsor', 'general', 'press', 'planned_giving']),
  name: z.string().trim().min(1).max(200),
  email: emailSchema,
  phone: z.string().trim().max(40).optional(),
  company: z.string().trim().max(200).optional(),
  message: z.string().trim().min(10).max(5000),
  additionalData: z.record(z.string(), z.any()).optional(),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req.headers);
  const limited = rateLimit(ip, 'contact', 3, 60_000);
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

  const parsed = contactBodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request.', details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { type, name, email, phone, company, message, additionalData } = parsed.data;

  try {
    const rows = await query<{ id: string }>(
      `INSERT INTO contact_inquiries (type, name, email, phone, company, message, additional_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        type,
        name,
        email,
        phone && phone.trim() !== '' ? phone : null,
        company && company.trim() !== '' ? company : null,
        message,
        additionalData ? JSON.stringify(additionalData) : null,
      ],
    );
    return NextResponse.json({ id: rows[0].id }, { status: 201 });
  } catch (err) {
    console.error('[contact] insert failed', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
