import 'server-only';
import { query } from '@/lib/db';

export async function upsertNewsletterSubscriber(
  email: string,
  source?: string,
): Promise<{ inserted: boolean }> {
  const normalizedSource =
    source && source.trim() !== '' ? source.trim() : null;
  const rows = await query<{ id: string }>(
    `INSERT INTO newsletter_subscribers (email, source)
     VALUES ($1, $2)
     ON CONFLICT (email) DO NOTHING
     RETURNING id`,
    [email, normalizedSource],
  );
  return { inserted: rows.length > 0 };
}
