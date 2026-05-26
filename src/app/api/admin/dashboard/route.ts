import { NextResponse, type NextRequest } from 'next/server';
import { adminGuard } from '@/lib/adminGuard';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface DashboardStats {
  members: { total: number; newThisMonth: number; suspended: number };
  events: { upcoming: number; draft: number };
  donations: { ytdAmount: number; ytdCount: number; monthAmount: number; recurringCount: number };
  photoSubmissions: { pending: number };
  contactInquiries: { new: number };
  blogPosts: { draft: number; published: number };
  youthEnrollments: { active: number };
}

interface CacheEntry {
  data: DashboardStats;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60_000;

async function fetchStats(): Promise<DashboardStats> {
  const [
    memberAgg,
    eventAgg,
    donationYtd,
    donationMonth,
    donationRecurring,
    photoPending,
    inquiryNew,
    blogAgg,
    youthActive,
  ] = await Promise.all([
    query<{ total: string; new_month: string; suspended: string }>(
      `SELECT
         COUNT(*)::text AS total,
         COUNT(*) FILTER (WHERE created_at >= date_trunc('month', now()))::text AS new_month,
         COUNT(*) FILTER (WHERE suspended_at IS NOT NULL)::text AS suspended
       FROM members`,
    ),
    query<{ upcoming: string; draft: string }>(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'published' AND starts_at >= now())::text AS upcoming,
         COUNT(*) FILTER (WHERE status = 'draft')::text AS draft
       FROM events`,
    ),
    query<{ amount: string; count: string }>(
      `SELECT COALESCE(SUM(amount_cents), 0)::text AS amount, COUNT(*)::text AS count
         FROM donations
        WHERE status = 'succeeded' AND created_at >= date_trunc('year', now())`,
    ),
    query<{ amount: string; count: string }>(
      `SELECT COALESCE(SUM(amount_cents), 0)::text AS amount, COUNT(*)::text AS count
         FROM donations
        WHERE status = 'succeeded' AND created_at >= date_trunc('month', now())`,
    ),
    query<{ count: string }>(
      `SELECT COUNT(*)::text AS count
         FROM donations
        WHERE status = 'succeeded' AND type = 'monthly' AND stripe_subscription_id IS NOT NULL`,
    ),
    query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM photo_submissions WHERE status = 'pending'`,
    ),
    query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM contact_inquiries WHERE status = 'new'`,
    ),
    query<{ draft: string; published: string }>(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'draft')::text AS draft,
         COUNT(*) FILTER (WHERE status = 'published')::text AS published
       FROM blog_posts`,
    ),
    query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM youth_enrollments WHERE status = 'enrolled'`,
    ),
  ]);

  return {
    members: {
      total: Number(memberAgg[0]?.total ?? '0'),
      newThisMonth: Number(memberAgg[0]?.new_month ?? '0'),
      suspended: Number(memberAgg[0]?.suspended ?? '0'),
    },
    events: {
      upcoming: Number(eventAgg[0]?.upcoming ?? '0'),
      draft: Number(eventAgg[0]?.draft ?? '0'),
    },
    donations: {
      ytdAmount: Number(donationYtd[0]?.amount ?? '0'),
      ytdCount: Number(donationYtd[0]?.count ?? '0'),
      monthAmount: Number(donationMonth[0]?.amount ?? '0'),
      recurringCount: Number(donationRecurring[0]?.count ?? '0'),
    },
    photoSubmissions: {
      pending: Number(photoPending[0]?.count ?? '0'),
    },
    contactInquiries: {
      new: Number(inquiryNew[0]?.count ?? '0'),
    },
    blogPosts: {
      draft: Number(blogAgg[0]?.draft ?? '0'),
      published: Number(blogAgg[0]?.published ?? '0'),
    },
    youthEnrollments: {
      active: Number(youthActive[0]?.count ?? '0'),
    },
  };
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const guard = await adminGuard(req);
  if (!guard.ok) return guard.response;
  const now = Date.now();
  const cached = cache.get('default');
  if (cached && cached.expiresAt > now) {
    return NextResponse.json({ stats: cached.data, cached: true }, { status: 200 });
  }
  const data = await fetchStats();
  cache.set('default', { data, expiresAt: now + CACHE_TTL_MS });
  return NextResponse.json({ stats: data, cached: false }, { status: 200 });
}
