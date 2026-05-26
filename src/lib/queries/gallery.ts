import 'server-only';
import { query } from '@/lib/db';
import type { GalleryCategory, GalleryPhoto } from '@/types/db';

const CATEGORY_COLUMNS = `
  id, slug, title, description, cover_image_url, display_order, created_at
`;
const PHOTO_COLUMNS = `
  id, category_id, file_url, thumb_url, caption, photographer_credit, taken_at,
  display_order, created_at
`;

export async function listGalleryCategories(): Promise<GalleryCategory[]> {
  return query<GalleryCategory>(
    `SELECT ${CATEGORY_COLUMNS} FROM gallery_categories
      ORDER BY display_order ASC, title ASC`,
  );
}

export async function getGalleryCategoryBySlug(
  slug: string,
): Promise<GalleryCategory | null> {
  const rows = await query<GalleryCategory>(
    `SELECT ${CATEGORY_COLUMNS} FROM gallery_categories WHERE slug = $1 LIMIT 1`,
    [slug],
  );
  return rows[0] ?? null;
}

export async function listPhotosByCategory(
  categoryId: string,
): Promise<GalleryPhoto[]> {
  return query<GalleryPhoto>(
    `SELECT ${PHOTO_COLUMNS} FROM gallery_photos
      WHERE category_id = $1
      ORDER BY display_order ASC, created_at ASC`,
    [categoryId],
  );
}

export async function listRecentPhotos(limit = 8): Promise<GalleryPhoto[]> {
  return query<GalleryPhoto>(
    `SELECT ${PHOTO_COLUMNS} FROM gallery_photos
      ORDER BY created_at DESC
      LIMIT $1`,
    [limit],
  );
}
