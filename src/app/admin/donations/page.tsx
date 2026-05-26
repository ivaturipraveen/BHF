import Link from 'next/link';
import { requireAdminPageSession } from '@/lib/adminSession';
import {
  listAllDonations,
  getDonationStats,
  countStubDonations,
} from '@/lib/queries/admin/donations';
import { AdminListHeader } from '@/components/admin/AdminListHeader';
import { AdminTable } from '@/components/admin/AdminTable';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { Donation } from '@/types/db';

export const dynamic = 'force-dynamic';

function formatCents(c: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(c / 100);
}
function formatDate(d: Date | null | undefined): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString();
}

export default async function AdminDonationsPage({
  searchParams,
}: {
  searchParams?: {
    status?: string;
    type?: string;
    from?: string;
    to?: string;
    includeStub?: string;
  };
}) {
  await requireAdminPageSession();
  const includeStub = searchParams?.includeStub === 'true';
  const [stats, donations, stubCount] = await Promise.all([
    getDonationStats({ includeStub }),
    listAllDonations({ status: searchParams?.status, includeStub }),
    countStubDonations(),
  ]);
  let filtered = donations;
  if (searchParams?.type) {
    filtered = filtered.filter((d) => d.type === searchParams.type);
  }
  if (searchParams?.from) {
    const from = new Date(searchParams.from);
    if (!Number.isNaN(from.getTime())) {
      filtered = filtered.filter((d) => new Date(d.created_at) >= from);
    }
  }
  if (searchParams?.to) {
    const to = new Date(searchParams.to);
    if (!Number.isNaN(to.getTime())) {
      filtered = filtered.filter((d) => new Date(d.created_at) <= to);
    }
  }

  return (
    <div>
      <AdminListHeader title="Donations" description="One-time and recurring contributions." />
      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
        {includeStub ? (
          <Badge variant="amber">Including stub/demo donations</Badge>
        ) : (
          <span className="text-warm-gray">
            Showing live donations only.
            {stubCount > 0 ? ` ${stubCount} stub record${stubCount === 1 ? '' : 's'} hidden — ` : ' '}
            <Link
              href="/admin/donations?includeStub=true"
              className="text-saffron underline"
            >
              include stub donations
            </Link>
          </span>
        )}
        {includeStub ? (
          <Link href="/admin/donations" className="text-saffron underline">
            Hide stub donations
          </Link>
        ) : null}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <p className="text-xs uppercase text-warm-gray">YTD</p>
          <p className="font-display text-2xl text-indigo">{formatCents(stats.totalYtdCents)}</p>
          <p className="text-xs text-warm-gray">{stats.totalYtdCount} gifts</p>
        </Card>
        <Card>
          <p className="text-xs uppercase text-warm-gray">This month</p>
          <p className="font-display text-2xl text-indigo">{formatCents(stats.totalMonthCents)}</p>
          <p className="text-xs text-warm-gray">{stats.totalMonthCount} gifts</p>
        </Card>
        <Card>
          <p className="text-xs uppercase text-warm-gray">Recurring donors</p>
          <p className="font-display text-2xl text-indigo">{stats.monthlyRecurringCount}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase text-warm-gray">Top donor</p>
          <p className="text-sm text-indigo font-medium">{stats.topDonors[0]?.donor_name ?? '—'}</p>
          <p className="text-xs text-warm-gray">{stats.topDonors[0] ? formatCents(stats.topDonors[0].total_cents) : ''}</p>
        </Card>
      </div>

      <form method="GET" className="mb-4 flex flex-wrap items-end gap-2 text-sm">
        <select name="type" defaultValue={searchParams?.type ?? ''} className="h-10 rounded-md border border-gray-300 bg-white px-2">
          <option value="">All types</option>
          <option value="one_time">One time</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
        <select name="status" defaultValue={searchParams?.status ?? ''} className="h-10 rounded-md border border-gray-300 bg-white px-2">
          <option value="">All statuses</option>
          <option value="succeeded">Succeeded</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
          <option value="canceled">Canceled</option>
        </select>
        <input type="date" name="from" defaultValue={searchParams?.from ?? ''} className="h-10 rounded-md border border-gray-300 bg-white px-2" />
        <input type="date" name="to" defaultValue={searchParams?.to ?? ''} className="h-10 rounded-md border border-gray-300 bg-white px-2" />
        <button type="submit" className="h-10 min-h-[44px] px-4 rounded-md bg-indigo text-white">Filter</button>
        <Link href="/admin/donations" className="h-10 min-h-[44px] inline-flex items-center px-4 text-warm-gray">Clear</Link>
      </form>

      <AdminTable<Donation>
        rows={filtered}
        rowKey={(d) => d.id}
        columns={[
          { header: 'Date', cell: (d) => formatDate(d.created_at) },
          { header: 'Donor', cell: (d) => (
            <div>
              <p className="text-indigo">{d.donor_name}</p>
              <p className="text-xs text-warm-gray">{d.donor_email}</p>
            </div>
          ) },
          { header: 'Amount', cell: (d) => <span className="font-medium">{formatCents(d.amount_cents)}</span> },
          { header: 'Type', cell: (d) => d.type },
          { header: 'Status', cell: (d) => <Badge variant={d.status === 'succeeded' ? 'indigo' : 'gray'}>{d.status}</Badge> },
          { header: 'Member', cell: (d) => d.member_id
            ? <Link href={`/admin/members/${d.member_id}`} className="text-xs text-saffron hover:text-amber-burnt underline">View</Link>
            : '—' },
        ]}
      />
    </div>
  );
}
