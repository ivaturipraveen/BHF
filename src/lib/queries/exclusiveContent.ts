import 'server-only';
import { query } from '@/lib/db';
import type { ExclusiveContent } from '@/types/db';

const COLUMNS = `
  id, title, description, category, content_type, content_url, thumbnail_url,
  duration_seconds, published_at, created_at, updated_at
`;

export async function listExclusiveContent(
  category?: string,
  limit?: number,
): Promise<ExclusiveContent[]> {
  const params: unknown[] = [];
  let sql = `SELECT ${COLUMNS} FROM exclusive_content`;
  if (category) {
    params.push(category);
    sql += ` WHERE category = $${params.length}`;
  }
  sql += ` ORDER BY published_at DESC`;
  if (limit !== undefined) {
    params.push(limit);
    sql += ` LIMIT $${params.length}`;
  }
  return query<ExclusiveContent>(sql, params);
}
