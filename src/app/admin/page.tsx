import Link from 'next/link';
import { requireAdminPageSession } from '@/lib/adminSession';
import { query } from '@/lib/db';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

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

async function fetchDashboardStats(): Promise<DashboardStats> {
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
    photoSubmissions: { pending: Number(photoPending[0]?.count ?? '0') },
    contactInquiries: { new: Number(inquiryNew[0]?.count ?? '0') },
    blogPosts: {
      draft: Number(blogAgg[0]?.draft ?? '0'),
      published: Number(blogAgg[0]?.published ?? '0'),
    },
    youthEnrollments: { active: Number(youthActive[0]?.count ?? '0') },
  };
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cents / 100);
}

interface KpiProps {
  label: string;
  value: string | number;
  sub?: string;
  href?: string;
}
function Kpi({ label, value, sub, href }: KpiProps) {
  const inner = (
    <Card className="h-full">
      <p className="text-xs uppercase tracking-wider text-warm-gray">{label}</p>
      <p className="font-display text-3xl text-indigo mt-1">{value}</p>
      {sub && <p className="text-xs text-warm-gray mt-1">{sub}</p>}
    </Card>
  );
  return href ? <Link href={href} className="block">{inner}</Link> : inner;
}

const QUICK_LINKS: { label: string; href: string }[] = [
  { label: 'New event', href: '/admin/events/new' },
  { label: 'New blog post', href: '/admin/blog-posts/new' },
  { label: 'Review photos', href: '/admin/photo-submissions' },
  { label: 'Members', href: '/admin/members' },
];

export default async function AdminDashboardPage() {
  const session = await requireAdminPageSession();
  const stats = await fetchDashboardStats();

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl text-indigo">Dashboard</h1>
          <p className="text-sm text-warm-gray mt-1">
            Welcome back, {session.email}. Here&apos;s what&apos;s happening across BHF today.
          </p>
        </div>
        <Badge variant="saffron">Signed in</Badge>
      </div>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-warm-gray mb-3">
          Members
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Kpi label="Total members" value={stats.members.total} href="/admin/members" />
          <Kpi label="New this month" value={stats.members.newThisMonth} />
          <Kpi label="Suspended" value={stats.members.suspended} />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-warm-gray mb-3">
          Donations
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Kpi
            label="YTD donations"
            value={formatCurrency(stats.donations.ytdAmount)}
            sub={`${stats.donations.ytdCount} gifts`}
            href="/admin/donations"
          />
          <Kpi label="This month" value={formatCurrency(stats.donations.monthAmount)} />
          <Kpi label="Recurring donors" value={stats.donations.recurringCount} />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-warm-gray mb-3">
          Engagement
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <Kpi label="Pending photos" value={stats.photoSubmissions.pending} href="/admin/photo-submissions" />
          <Kpi label="New inquiries" value={stats.contactInquiries.new} href="/admin/contact-inquiries" />
          <Kpi label="Upcoming events" value={stats.events.upcoming} href="/admin/events" />
          <Kpi label="Draft posts" value={stats.blogPosts.draft} href="/admin/blog-posts" />
          <Kpi label="Active youth enrollments" value={stats.youthEnrollments.active} href="/admin/youth-registrations" />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-warm-gray mb-3">
          Quick links
        </h2>
        <div className="flex flex-wrap gap-2">
          {QUICK_LINKS.map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className="inline-flex items-center px-4 py-2 min-h-[44px] rounded-full bg-white border border-gray-200 text-sm text-indigo hover:bg-cream"
            >
              {q.label}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-warm-gray mb-3">
          Recent activity
        </h2>
        <Card>
          <p className="text-sm text-warm-gray">Coming soon — activity feed will land in Phase 7.</p>
        </Card>
      </section>
    </div>
  );
}
