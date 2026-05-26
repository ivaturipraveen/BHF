import type { MigrationBuilder } from 'node-pg-migrate';

export const shorthands = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TABLE blog_posts (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      slug text UNIQUE NOT NULL,
      title text NOT NULL,
      excerpt text NOT NULL,
      body_md text NOT NULL,
      hero_image_url text,
      author_id uuid REFERENCES admins(id),
      tags text[],
      featured boolean NOT NULL DEFAULT false,
      status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
      published_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  pgm.sql(`CREATE INDEX blog_posts_status_idx ON blog_posts (status)`);
  pgm.sql(`CREATE INDEX blog_posts_published_at_idx ON blog_posts (published_at DESC)`);
  pgm.sql(`CREATE INDEX blog_posts_slug_idx ON blog_posts (slug)`);

  pgm.sql(`
    CREATE TRIGGER blog_posts_set_updated_at
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`DROP TABLE IF EXISTS blog_posts CASCADE`);
}
