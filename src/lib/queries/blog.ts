import 'server-only';
import { query } from '@/lib/db';
import type { BlogPost } from '@/types/db';

const COLUMNS = `
  id, slug, title, excerpt, body_md, hero_image_url, author_id, tags, featured,
  status, published_at, created_at, updated_at
`;

export async function listBlogPosts(limit?: number): Promise<BlogPost[]> {
  if (limit !== undefined) {
    return query<BlogPost>(
      `SELECT ${COLUMNS} FROM blog_posts
        WHERE status = 'published' AND published_at <= now()
        ORDER BY published_at DESC
        LIMIT $1`,
      [limit],
    );
  }
  return query<BlogPost>(
    `SELECT ${COLUMNS} FROM blog_posts
      WHERE status = 'published' AND published_at <= now()
      ORDER BY published_at DESC`,
  );
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const rows = await query<BlogPost>(
    `SELECT ${COLUMNS} FROM blog_posts
      WHERE slug = $1 AND status = 'published' AND published_at <= now()
      LIMIT 1`,
    [slug],
  );
  return rows[0] ?? null;
}

export async function listFeaturedBlogPosts(limit = 3): Promise<BlogPost[]> {
  return query<BlogPost>(
    `SELECT ${COLUMNS} FROM blog_posts
      WHERE status = 'published' AND published_at <= now() AND featured = true
      ORDER BY published_at DESC
      LIMIT $1`,
    [limit],
  );
}
