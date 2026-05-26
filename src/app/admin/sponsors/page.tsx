import Link from 'next/link';
import { requireAdminPageSession } from '@/lib/adminSession';
import { listAllSponsors } from '@/lib/queries/admin/sponsors';
import { AdminListHeader } from '@/components/admin/AdminListHeader';
import { AdminSearchForm } from '@/components/admin/AdminSearchForm';
import { AdminTable } from '@/components/admin/AdminTable';
import { Badge } from '@/components/ui/Badge';
import { DeleteButton } from '@/components/admin/DeleteButton';
import type { Sponsor } from '@/types/db';

export const dynamic = 'force-dynamic';

export default async function AdminSponsorsPage({
  searchParams,
}: {
  searchParams?: { search?: string };
}) {
  await requireAdminPageSession();
  const sponsors = await listAllSponsors();
  const search = (searchParams?.search ?? '').toLowerCase().trim();
  const filtered = search
    ? sponsors.filter((s) => s.name.toLowerCase().includes(search))
    : sponsors;

  return (
    <div>
      <AdminListHeader title="Sponsors" newHref="/admin/sponsors/new" newLabel="New sponsor" />
      <div className="mb-4">
        <AdminSearchForm action="/admin/sponsors" defaultValue={search} placeholder="Search name…" clearHref="/admin/sponsors" />
      </div>
      <AdminTable<Sponsor>
        rows={filtered}
        rowKey={(s) => s.id}
        columns={[
          { header: 'Name', cell: (s) => <Link href={`/admin/sponsors/${s.id}`} className="font-medium text-indigo hover:text-saffron">{s.name}</Link> },
          { header: 'Tier', cell: (s) => s.tier ?? '—' },
          { header: 'Order', cell: (s) => s.display_order },
          { header: 'Active', cell: (s) => s.active ? <Badge variant="indigo">Active</Badge> : <Badge variant="gray">Hidden</Badge> },
          { header: 'Actions', cell: (s) => (
            <div className="flex items-center gap-2">
              <Link href={`/admin/sponsors/${s.id}`} className="text-xs text-indigo hover:text-saffron px-2 py-2 min-h-[36px] inline-flex items-center">Edit</Link>
              <DeleteButton resourcePath={`/api/admin/sponsors/${s.id}`} />
            </div>
          ) },
        ]}
      />
    </div>
  );
}
