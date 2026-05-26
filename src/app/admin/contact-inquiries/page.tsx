import Link from 'next/link';
import { requireAdminPageSession } from '@/lib/adminSession';
import { listAllContactInquiries } from '@/lib/queries/admin/contactInquiries';
import { AdminListHeader } from '@/components/admin/AdminListHeader';
import { AdminTable } from '@/components/admin/AdminTable';
import { Badge } from '@/components/ui/Badge';
import type { ContactInquiry } from '@/types/db';

export const dynamic = 'force-dynamic';

function formatDate(d: Date | null | undefined): string {
  if (!d) return '—';
  return new Date(d).toLocaleString();
}

export default async function AdminContactInquiriesPage({
  searchParams,
}: {
  searchParams?: { type?: string; status?: string };
}) {
  await requireAdminPageSession();
  const inquiries = await listAllContactInquiries(searchParams?.status);
  const filtered = searchParams?.type
    ? inquiries.filter((i) => i.type === searchParams.type)
    : inquiries;

  return (
    <div>
      <AdminListHeader title="Contact inquiries" description="Volunteer, sponsor, press, planned giving, and general questions." />
      <form method="GET" className="mb-4 flex flex-wrap items-end gap-2 text-sm">
        <select name="type" defaultValue={searchParams?.type ?? ''} className="h-10 rounded-md border border-gray-300 bg-white px-2">
          <option value="">All types</option>
          <option value="volunteer">Volunteer</option>
          <option value="sponsor">Sponsor</option>
          <option value="general">General</option>
          <option value="press">Press</option>
          <option value="planned_giving">Planned giving</option>
        </select>
        <select name="status" defaultValue={searchParams?.status ?? ''} className="h-10 rounded-md border border-gray-300 bg-white px-2">
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="closed">Closed</option>
        </select>
        <button type="submit" className="h-10 min-h-[44px] px-4 rounded-md bg-indigo text-white">Filter</button>
        <Link href="/admin/contact-inquiries" className="h-10 min-h-[44px] inline-flex items-center px-4 text-warm-gray">Clear</Link>
      </form>
      <AdminTable<ContactInquiry>
        rows={filtered}
        rowKey={(i) => i.id}
        columns={[
          { header: 'Type', cell: (i) => i.type },
          { header: 'Name', cell: (i) => <Link href={`/admin/contact-inquiries/${i.id}`} className="font-medium text-indigo hover:text-saffron">{i.name ?? '—'}</Link> },
          { header: 'Email', cell: (i) => i.email ?? '—' },
          { header: 'Submitted', cell: (i) => formatDate(i.created_at) },
          { header: 'Status', cell: (i) => <Badge variant={i.status === 'new' ? 'saffron' : i.status === 'contacted' ? 'indigo' : 'gray'}>{i.status}</Badge> },
        ]}
      />
    </div>
  );
}
