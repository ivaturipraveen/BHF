import 'server-only';
import { query } from '@/lib/db';
import type { GalleryPhoto } from '@/types/db';

const COLUMNS = `id, category_id, file_url, thumb_url, caption, photographer_credit, taken_at, display_order, created_at`;

export interface GalleryPhotoCreateInput {
  category_id: string | null;
  file_url: string;
  thumb_url?: string | null;
  caption?: string | null;
  photographer_credit?: string | null;
  taken_at?: string | null;
  display_order?: number;
}
export type GalleryPhotoUpdateInput = Partial<GalleryPhotoCreateInput>;

const UPDATABLE_FIELDS: ReadonlySet<string> = new Set([
  'category_id',
  'file_url',
  'thumb_url',
  'caption',
  'photographer_credit',
  'taken_at',
  'display_order',
]);

export async function listGalleryPhotos(categoryId?: string): Promise<GalleryPhoto[]> {
  if (categoryId) {
    return query<GalleryPhoto>(
      `SELECT ${COLUMNS} FROM gallery_photos WHERE category_id = $1 ORDER BY display_order ASC, created_at DESC`,
      [categoryId],
    );
  }
  return query<GalleryPhoto>(
    `SELECT ${COLUMNS} FROM gallery_photos ORDER BY created_at DESC`,
  );
}

export async function getGalleryPhotoById(id: string): Promise<GalleryPhoto | null> {
  const rows = await query<GalleryPhoto>(
    `SELECT ${COLUMNS} FROM gallery_photos WHERE id = $1 LIMIT 1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function createGalleryPhoto(input: GalleryPhotoCreateInput): Promise<GalleryPhoto> {
  const rows = await query<GalleryPhoto>(
    `INSERT INTO gallery_photos (category_id, file_url, thumb_url, caption, photographer_credit, taken_at, display_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING ${COLUMNS}`,
    [
      input.category_id,
      input.file_url,
      input.thumb_url ?? null,
      input.caption ?? null,
      input.photographer_credit ?? null,
      input.taken_at ?? null,
      input.display_order ?? 0,
    ],
  );
  return rows[0];
}

export async function updateGalleryPhoto(
  id: string,
  input: GalleryPhotoUpdateInput,
): Promise<GalleryPhoto | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;
  for (const [k, v] of Object.entries(input)) {
    if (v === undefined) continue;
    if (!UPDATABLE_FIELDS.has(k)) continue;
    fields.push(`${k} = $${idx}`);
    values.push(v);
    idx++;
  }
  if (fields.length === 0) return getGalleryPhotoById(id);
  values.push(id);
  const rows = await query<GalleryPhoto>(
    `UPDATE gallery_photos SET ${fields.join(', ')} WHERE id = $${idx} RETURNING ${COLUMNS}`,
    values,
  );
  return rows[0] ?? null;
}

export async function deleteGalleryPhoto(id: string): Promise<boolean> {
  const rows = await query<{ id: string }>(
    `DELETE FROM gallery_photos WHERE id = $1 RETURNING id`,
    [id],
  );
  return rows.length > 0;
}
