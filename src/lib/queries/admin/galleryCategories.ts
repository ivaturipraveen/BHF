import 'server-only';
import { query } from '@/lib/db';
import type { GalleryCategory } from '@/types/db';

const COLUMNS = `id, slug, title, description, cover_image_url, display_order, created_at`;

export interface GalleryCategoryCreateInput {
  slug: string;
  title: string;
  description?: string | null;
  cover_image_url?: string | null;
  display_order?: number;
}
export type GalleryCategoryUpdateInput = Partial<GalleryCategoryCreateInput>;

const UPDATABLE_FIELDS: ReadonlySet<string> = new Set([
  'slug',
  'title',
  'description',
  'cover_image_url',
  'display_order',
]);

export async function listAllGalleryCategories(): Promise<GalleryCategory[]> {
  return query<GalleryCategory>(
    `SELECT ${COLUMNS} FROM gallery_categories ORDER BY display_order ASC, title ASC`,
  );
}

export async function getGalleryCategoryById(id: string): Promise<GalleryCategory | null> {
  const rows = await query<GalleryCategory>(
    `SELECT ${COLUMNS} FROM gallery_categories WHERE id = $1 LIMIT 1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function createGalleryCategory(input: GalleryCategoryCreateInput): Promise<GalleryCategory> {
  const rows = await query<GalleryCategory>(
    `INSERT INTO gallery_categories (slug, title, description, cover_image_url, display_order)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING ${COLUMNS}`,
    [
      input.slug,
      input.title,
      input.description ?? null,
      input.cover_image_url ?? null,
      input.display_order ?? 0,
    ],
  );
  return rows[0];
}

export async function updateGalleryCategory(
  id: string,
  input: GalleryCategoryUpdateInput,
): Promise<GalleryCategory | null> {
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
  if (fields.length === 0) return getGalleryCategoryById(id);
  values.push(id);
  const rows = await query<GalleryCategory>(
    `UPDATE gallery_categories SET ${fields.join(', ')} WHERE id = $${idx} RETURNING ${COLUMNS}`,
    values,
  );
  return rows[0] ?? null;
}

export async function countPhotosInCategory(categoryId: string): Promise<number> {
  const rows = await query<{ c: string }>(
    `SELECT COUNT(*)::text AS c FROM gallery_photos WHERE category_id = $1`,
    [categoryId],
  );
  return Number(rows[0]?.c ?? '0');
}

export async function deleteGalleryCategory(id: string): Promise<boolean> {
  const rows = await query<{ id: string }>(
    `DELETE FROM gallery_categories WHERE id = $1 RETURNING id`,
    [id],
  );
  return rows.length > 0;
}
