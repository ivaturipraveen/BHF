import 'server-only';
import { query } from '@/lib/db';
import type { BlogPost } from '@/types/db';

const COLUMNS = `id, slug, title, excerpt, body_md, hero_image_url, author_id, tags, featured, status, published_at, created_at, updated_at`;

export interface BlogPostCreateInput {
  slug: string;
  title: string;
  excerpt: string;
  body_md: string;
  hero_image_url?: string | null;
  author_id?: string | null;
  tags?: string[] | null;
  featured?: boolean;
  status?: 'draft' | 'published' | 'archived';
  published_at?: string | null;
}
export type BlogPostUpdateInput = Partial<BlogPostCreateInput>;

const UPDATABLE_FIELDS: ReadonlySet<string> = new Set([
  'slug',
  'title',
  'excerpt',
  'body_md',
  'hero_image_url',
  'author_id',
  'tags',
  'featured',
  'status',
  'published_at',
]);

export async function listAllBlogPosts(): Promise<BlogPost[]> {
  return query<BlogPost>(
    `SELECT ${COLUMNS} FROM blog_posts ORDER BY COALESCE(published_at, created_at) DESC`,
  );
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  const rows = await query<BlogPost>(
    `SELECT ${COLUMNS} FROM blog_posts WHERE id = $1 LIMIT 1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function createBlogPost(input: BlogPostCreateInput): Promise<BlogPost> {
  const rows = await query<BlogPost>(
    `INSERT INTO blog_posts (slug, title, excerpt, body_md, hero_image_url, author_id, tags, featured, status, published_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING ${COLUMNS}`,
    [
      input.slug,
      input.title,
      input.excerpt,
      input.body_md,
      input.hero_image_url ?? null,
      input.author_id ?? null,
      input.tags ?? null,
      input.featured ?? false,
      input.status ?? 'draft',
      input.published_at ?? null,
    ],
  );
  return rows[0];
}

export async function updateBlogPost(
  id: string,
  input: BlogPostUpdateInput,
): Promise<BlogPost | null> {
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
  if (fields.length === 0) return getBlogPostById(id);
  values.push(id);
  const rows = await query<BlogPost>(
    `UPDATE blog_posts SET ${fields.join(', ')} WHERE id = $${idx} RETURNING ${COLUMNS}`,
    values,
  );
  return rows[0] ?? null;
}

export async function deleteBlogPost(id: string): Promise<boolean> {
  const rows = await query<{ id: string }>(
    `DELETE FROM blog_posts WHERE id = $1 RETURNING id`,
    [id],
  );
  return rows.length > 0;
}
