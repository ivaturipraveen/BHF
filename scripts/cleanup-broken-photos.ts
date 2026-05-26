/* eslint-disable no-console */
import { config as loadDotenv } from 'dotenv';
loadDotenv({ path: '/home/ubuntu/.bw_env' });

import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const p = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const broken = [
  'photo-1604608672516-f1b9b1f8a8c9',
  'photo-1604423481997-7551b97e0d4d',
  'photo-1615875218538-1d387c5a90b1',
  'photo-1583395145149-9c75cab2c1a4',
  'photo-1605542316840-6b9c34ce3a3e',
];

(async () => {
  for (const id of broken) {
    const like = '%' + id + '%';
    const events = await p.query(
      'UPDATE events SET hero_image_url = NULL WHERE hero_image_url LIKE $1',
      [like],
    );
    const progs = await p.query(
      'UPDATE programs SET hero_image_url = NULL WHERE hero_image_url LIKE $1',
      [like],
    );
    const blog = await p.query(
      'UPDATE blog_posts SET hero_image_url = NULL WHERE hero_image_url LIKE $1',
      [like],
    );
    const homepage = await p.query(
      'UPDATE homepage_config SET hero_image_url = NULL WHERE hero_image_url LIKE $1',
      [like],
    );
    // gallery_photos.file_url is NOT NULL — DELETE rather than NULL out.
    const gallery = await p.query(
      'DELETE FROM gallery_photos WHERE file_url LIKE $1',
      [like],
    );
    console.log({
      id,
      events: events.rowCount,
      progs: progs.rowCount,
      blog: blog.rowCount,
      homepage: homepage.rowCount,
      gallery: gallery.rowCount,
    });
  }
  await p.end();
})();
