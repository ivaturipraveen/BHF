// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { query } from '../../src/lib/db';
import {
  adminFetch,
  adminLogin,
  ensureServerReachable,
  nanoid,
  type AdminCtx,
} from './_helpers';

let ctx: AdminCtx;

// Track every row we create so we can clean up if a smoke-test halts midway.
const createdEventIds: string[] = [];
const createdProgramIds: string[] = [];
const createdGalleryCategoryIds: string[] = [];
const createdLeadershipIds: string[] = [];
const createdBlogPostIds: string[] = [];
const createdSponsorIds: string[] = [];
const createdAnnualReportIds: string[] = [];
const createdExclusiveContentIds: string[] = [];

beforeAll(async () => {
  await ensureServerReachable();
  ctx = await adminLogin();
});

afterAll(async () => {
  if (createdEventIds.length) {
    await query(`DELETE FROM rsvps WHERE event_id = ANY($1::uuid[])`, [createdEventIds]);
    await query(`DELETE FROM events WHERE id = ANY($1::uuid[])`, [createdEventIds]);
  }
  if (createdProgramIds.length) {
    await query(`DELETE FROM youth_enrollments WHERE program_id = ANY($1::uuid[])`, [createdProgramIds]);
    await query(`DELETE FROM programs WHERE id = ANY($1::uuid[])`, [createdProgramIds]);
  }
  if (createdGalleryCategoryIds.length) {
    await query(`DELETE FROM gallery_categories WHERE id = ANY($1::uuid[])`, [createdGalleryCategoryIds]);
  }
  if (createdLeadershipIds.length) {
    await query(`DELETE FROM leadership WHERE id = ANY($1::uuid[])`, [createdLeadershipIds]);
  }
  if (createdBlogPostIds.length) {
    await query(`DELETE FROM blog_posts WHERE id = ANY($1::uuid[])`, [createdBlogPostIds]);
  }
  if (createdSponsorIds.length) {
    await query(`DELETE FROM sponsors WHERE id = ANY($1::uuid[])`, [createdSponsorIds]);
  }
  if (createdAnnualReportIds.length) {
    await query(`DELETE FROM annual_reports WHERE id = ANY($1::uuid[])`, [createdAnnualReportIds]);
  }
  if (createdExclusiveContentIds.length) {
    await query(`DELETE FROM exclusive_content WHERE id = ANY($1::uuid[])`, [createdExclusiveContentIds]);
  }
});

async function ok<T = any>(res: Response): Promise<T> {
  if (res.status >= 400) {
    const text = await res.text();
    throw new Error(`request failed: ${res.status} ${text}`);
  }
  return (await res.json()) as T;
}

describe('CRUD smoke: events', () => {
  it('list → create → get → update → delete', async () => {
    const list = await adminFetch('/api/admin/events', undefined, ctx);
    expect(list.status).toBe(200);
    const listJson = (await list.json()) as { events: unknown[] };
    expect(Array.isArray(listJson.events)).toBe(true);

    const create = await adminFetch(
      '/api/admin/events',
      {
        method: 'POST',
        body: JSON.stringify({
          title: `QA events ${nanoid(6)}`,
          slug: `qa-events-${nanoid(8)}`,
          description_md: 'smoke',
          starts_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
          type: 'other',
        }),
      },
      ctx,
    );
    const { event } = await ok<{ event: { id: string } }>(create);
    createdEventIds.push(event.id);

    const get = await adminFetch(`/api/admin/events/${event.id}`, undefined, ctx);
    expect(get.status).toBe(200);

    const upd = await adminFetch(
      `/api/admin/events/${event.id}`,
      { method: 'PATCH', body: JSON.stringify({ title: 'smoke-updated' }) },
      ctx,
    );
    const { event: updated } = await ok<{ event: { title: string } }>(upd);
    expect(updated.title).toBe('smoke-updated');

    const del = await adminFetch(`/api/admin/events/${event.id}`, { method: 'DELETE' }, ctx);
    expect(del.status).toBe(204);
    // remove from cleanup since it succeeded
    const idx = createdEventIds.indexOf(event.id);
    if (idx >= 0) createdEventIds.splice(idx, 1);
  });
});

describe('CRUD smoke: programs', () => {
  it('list → create → get → update → delete', async () => {
    const list = await adminFetch('/api/admin/programs', undefined, ctx);
    expect(list.status).toBe(200);

    const create = await adminFetch(
      '/api/admin/programs',
      {
        method: 'POST',
        body: JSON.stringify({
          title: `QA program ${nanoid(6)}`,
          slug: `qa-program-${nanoid(8)}`,
          category: 'cultural',
          frequency: 'monthly',
          description_md: 'smoke',
          short_description: 'smoke desc',
        }),
      },
      ctx,
    );
    const { program } = await ok<{ program: { id: string } }>(create);
    createdProgramIds.push(program.id);

    const get = await adminFetch(`/api/admin/programs/${program.id}`, undefined, ctx);
    expect(get.status).toBe(200);

    const upd = await adminFetch(
      `/api/admin/programs/${program.id}`,
      { method: 'PATCH', body: JSON.stringify({ short_description: 'updated' }) },
      ctx,
    );
    const { program: updated } = await ok<{ program: { short_description: string } }>(upd);
    expect(updated.short_description).toBe('updated');

    const del = await adminFetch(`/api/admin/programs/${program.id}`, { method: 'DELETE' }, ctx);
    expect(del.status).toBe(204);
    const idx = createdProgramIds.indexOf(program.id);
    if (idx >= 0) createdProgramIds.splice(idx, 1);
  });
});

describe('CRUD smoke: gallery-categories', () => {
  it('list → create → get → update → delete', async () => {
    const list = await adminFetch('/api/admin/gallery-categories', undefined, ctx);
    expect(list.status).toBe(200);

    const create = await adminFetch(
      '/api/admin/gallery-categories',
      {
        method: 'POST',
        body: JSON.stringify({
          title: `QA gallery ${nanoid(6)}`,
          slug: `qa-gallery-${nanoid(8)}`,
        }),
      },
      ctx,
    );
    const { category } = await ok<{ category: { id: string } }>(create);
    createdGalleryCategoryIds.push(category.id);

    const get = await adminFetch(`/api/admin/gallery-categories/${category.id}`, undefined, ctx);
    expect(get.status).toBe(200);

    const upd = await adminFetch(
      `/api/admin/gallery-categories/${category.id}`,
      { method: 'PATCH', body: JSON.stringify({ description: 'smoke-desc' }) },
      ctx,
    );
    expect(upd.status).toBe(200);

    const del = await adminFetch(
      `/api/admin/gallery-categories/${category.id}`,
      { method: 'DELETE' },
      ctx,
    );
    expect(del.status).toBe(204);
    const idx = createdGalleryCategoryIds.indexOf(category.id);
    if (idx >= 0) createdGalleryCategoryIds.splice(idx, 1);
  });
});

describe('CRUD smoke: leadership', () => {
  it('list → create → get → update → delete', async () => {
    const list = await adminFetch('/api/admin/leadership', undefined, ctx);
    expect(list.status).toBe(200);

    const create = await adminFetch(
      '/api/admin/leadership',
      {
        method: 'POST',
        body: JSON.stringify({
          name: `QA ${nanoid(6)}`,
          role: 'Tester',
          bio: 'smoke',
          section: 'working_group',
        }),
      },
      ctx,
    );
    const { leader } = await ok<{ leader: { id: string } }>(create);
    createdLeadershipIds.push(leader.id);

    const get = await adminFetch(`/api/admin/leadership/${leader.id}`, undefined, ctx);
    expect(get.status).toBe(200);

    const upd = await adminFetch(
      `/api/admin/leadership/${leader.id}`,
      { method: 'PATCH', body: JSON.stringify({ role: 'Senior Tester' }) },
      ctx,
    );
    expect(upd.status).toBe(200);

    const del = await adminFetch(`/api/admin/leadership/${leader.id}`, { method: 'DELETE' }, ctx);
    expect(del.status).toBe(204);
    const idx = createdLeadershipIds.indexOf(leader.id);
    if (idx >= 0) createdLeadershipIds.splice(idx, 1);
  });
});

describe('CRUD smoke: blog-posts', () => {
  it('list → create → get → update → delete', async () => {
    const list = await adminFetch('/api/admin/blog-posts', undefined, ctx);
    expect(list.status).toBe(200);

    const create = await adminFetch(
      '/api/admin/blog-posts',
      {
        method: 'POST',
        body: JSON.stringify({
          title: `QA post ${nanoid(6)}`,
          slug: `qa-post-${nanoid(8)}`,
          excerpt: 'smoke excerpt',
          body_md: 'smoke body',
        }),
      },
      ctx,
    );
    const { post } = await ok<{ post: { id: string } }>(create);
    createdBlogPostIds.push(post.id);

    const get = await adminFetch(`/api/admin/blog-posts/${post.id}`, undefined, ctx);
    expect(get.status).toBe(200);

    const upd = await adminFetch(
      `/api/admin/blog-posts/${post.id}`,
      { method: 'PATCH', body: JSON.stringify({ excerpt: 'updated excerpt' }) },
      ctx,
    );
    expect(upd.status).toBe(200);

    const del = await adminFetch(`/api/admin/blog-posts/${post.id}`, { method: 'DELETE' }, ctx);
    expect(del.status).toBe(204);
    const idx = createdBlogPostIds.indexOf(post.id);
    if (idx >= 0) createdBlogPostIds.splice(idx, 1);
  });
});

describe('CRUD smoke: sponsors', () => {
  it('list → create → get → update → delete', async () => {
    const list = await adminFetch('/api/admin/sponsors', undefined, ctx);
    expect(list.status).toBe(200);

    const create = await adminFetch(
      '/api/admin/sponsors',
      {
        method: 'POST',
        body: JSON.stringify({
          name: `QA Sponsor ${nanoid(6)}`,
          logo_url: 'https://example.com/logo.png',
        }),
      },
      ctx,
    );
    const { sponsor } = await ok<{ sponsor: { id: string } }>(create);
    createdSponsorIds.push(sponsor.id);

    const get = await adminFetch(`/api/admin/sponsors/${sponsor.id}`, undefined, ctx);
    expect(get.status).toBe(200);

    const upd = await adminFetch(
      `/api/admin/sponsors/${sponsor.id}`,
      { method: 'PATCH', body: JSON.stringify({ tier: 'gold' }) },
      ctx,
    );
    expect(upd.status).toBe(200);

    const del = await adminFetch(`/api/admin/sponsors/${sponsor.id}`, { method: 'DELETE' }, ctx);
    expect(del.status).toBe(204);
    const idx = createdSponsorIds.indexOf(sponsor.id);
    if (idx >= 0) createdSponsorIds.splice(idx, 1);
  });
});

describe('CRUD smoke: annual-reports', () => {
  it('list → create → get → update → delete', async () => {
    const list = await adminFetch('/api/admin/annual-reports', undefined, ctx);
    expect(list.status).toBe(200);

    // pick a year far enough out that it won't collide with seeded reports.
    const year = 2200 + Math.floor(Math.random() * 500);
    const create = await adminFetch(
      '/api/admin/annual-reports',
      {
        method: 'POST',
        body: JSON.stringify({
          year,
          title: `QA report ${year}`,
          pdf_url: `https://example.com/report-${year}.pdf`,
        }),
      },
      ctx,
    );
    const { report } = await ok<{ report: { id: string } }>(create);
    createdAnnualReportIds.push(report.id);

    const get = await adminFetch(`/api/admin/annual-reports/${report.id}`, undefined, ctx);
    expect(get.status).toBe(200);

    const upd = await adminFetch(
      `/api/admin/annual-reports/${report.id}`,
      { method: 'PATCH', body: JSON.stringify({ title: 'updated' }) },
      ctx,
    );
    expect(upd.status).toBe(200);

    const del = await adminFetch(
      `/api/admin/annual-reports/${report.id}`,
      { method: 'DELETE' },
      ctx,
    );
    expect(del.status).toBe(204);
    const idx = createdAnnualReportIds.indexOf(report.id);
    if (idx >= 0) createdAnnualReportIds.splice(idx, 1);
  });
});

describe('CRUD smoke: exclusive-content', () => {
  it('list → create → get → update → delete', async () => {
    const list = await adminFetch('/api/admin/exclusive-content', undefined, ctx);
    expect(list.status).toBe(200);

    const create = await adminFetch(
      '/api/admin/exclusive-content',
      {
        method: 'POST',
        body: JSON.stringify({
          title: `QA exclusive ${nanoid(6)}`,
          category: 'yoga',
          content_type: 'video',
          content_url: 'https://example.com/video.mp4',
        }),
      },
      ctx,
    );
    const { item } = await ok<{ item: { id: string } }>(create);
    createdExclusiveContentIds.push(item.id);

    const get = await adminFetch(`/api/admin/exclusive-content/${item.id}`, undefined, ctx);
    expect(get.status).toBe(200);

    const upd = await adminFetch(
      `/api/admin/exclusive-content/${item.id}`,
      { method: 'PATCH', body: JSON.stringify({ description: 'updated' }) },
      ctx,
    );
    expect(upd.status).toBe(200);

    const del = await adminFetch(
      `/api/admin/exclusive-content/${item.id}`,
      { method: 'DELETE' },
      ctx,
    );
    expect(del.status).toBe(204);
    const idx = createdExclusiveContentIds.indexOf(item.id);
    if (idx >= 0) createdExclusiveContentIds.splice(idx, 1);
  });
});

describe('pages — singleton PATCH on about-hero (revert after)', () => {
  it('PATCH /api/admin/pages/about-hero updates body_md then reverts', async () => {
    const before = await adminFetch('/api/admin/pages/about-hero', undefined, ctx);
    expect(before.status).toBe(200);
    const beforeJson = (await before.json()) as {
      page: { body_md: string | null; title: string | null };
    };
    const originalBody = beforeJson.page.body_md ?? '';

    const tag = `<!-- qa-test-${nanoid(8)} -->`;
    const upd = await adminFetch(
      '/api/admin/pages/about-hero',
      { method: 'PATCH', body: JSON.stringify({ body_md: `${originalBody}\n${tag}` }) },
      ctx,
    );
    expect(upd.status).toBe(200);
    const updJson = (await upd.json()) as { page: { body_md: string | null } };
    expect(updJson.page.body_md ?? '').toContain(tag);

    const revert = await adminFetch(
      '/api/admin/pages/about-hero',
      { method: 'PATCH', body: JSON.stringify({ body_md: originalBody }) },
      ctx,
    );
    expect(revert.status).toBe(200);
  });
});

describe('homepage-config — singleton PATCH (revert after)', () => {
  it('PATCH /api/admin/homepage-config updates stat then reverts', async () => {
    const before = await adminFetch('/api/admin/homepage-config', undefined, ctx);
    expect(before.status).toBe(200);
    const beforeJson = (await before.json()) as {
      config: { stat_seva_hours: number };
    };
    const original = beforeJson.config.stat_seva_hours;

    const upd = await adminFetch(
      '/api/admin/homepage-config',
      { method: 'PATCH', body: JSON.stringify({ stat_seva_hours: original + 1 }) },
      ctx,
    );
    expect(upd.status).toBe(200);
    const updJson = (await upd.json()) as { config: { stat_seva_hours: number } };
    expect(updJson.config.stat_seva_hours).toBe(original + 1);

    const revert = await adminFetch(
      '/api/admin/homepage-config',
      { method: 'PATCH', body: JSON.stringify({ stat_seva_hours: original }) },
      ctx,
    );
    expect(revert.status).toBe(200);
  });
});
