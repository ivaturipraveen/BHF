// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';
import { adminFetch, adminLogin, ensureServerReachable, type AdminCtx } from './_helpers';

let ctx: AdminCtx;

beforeAll(async () => {
  await ensureServerReachable();
  ctx = await adminLogin();
});

interface DashboardStats {
  members: { total: number; newThisMonth: number; suspended: number };
  events: { upcoming: number; draft: number };
  donations: {
    ytdAmount: number;
    ytdCount: number;
    monthAmount: number;
    recurringCount: number;
  };
  photoSubmissions: { pending: number };
  contactInquiries: { new: number };
  blogPosts: { draft: number; published: number };
  youthEnrollments: { active: number };
}

describe('GET /api/admin/dashboard', () => {
  it('returns 200 with the expected stats shape', async () => {
    const res = await adminFetch('/api/admin/dashboard', undefined, ctx);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { stats: DashboardStats };
    const s = body.stats;

    expect(typeof s).toBe('object');
    expect(s).not.toBeNull();

    // members
    expect(typeof s.members.total).toBe('number');
    expect(typeof s.members.newThisMonth).toBe('number');
    expect(typeof s.members.suspended).toBe('number');

    // events
    expect(typeof s.events.upcoming).toBe('number');
    expect(typeof s.events.draft).toBe('number');

    // donations
    expect(typeof s.donations.ytdAmount).toBe('number');
    expect(typeof s.donations.ytdCount).toBe('number');
    expect(typeof s.donations.monthAmount).toBe('number');
    expect(typeof s.donations.recurringCount).toBe('number');

    // photoSubmissions
    expect(typeof s.photoSubmissions.pending).toBe('number');

    // contactInquiries
    expect(typeof s.contactInquiries.new).toBe('number');

    // blogPosts
    expect(typeof s.blogPosts.draft).toBe('number');
    expect(typeof s.blogPosts.published).toBe('number');

    // youthEnrollments
    expect(typeof s.youthEnrollments.active).toBe('number');
  });
});
