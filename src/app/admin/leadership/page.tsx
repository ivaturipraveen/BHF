import Link from 'next/link';
import { requireAdminPageSession } from '@/lib/adminSession';
import { listAllLeadership } from '@/lib/queries/admin/leadership';
import { AdminListHeader } from '@/components/admin/AdminListHeader';
import { AdminSearchForm } from '@/components/admin/AdminSearchForm';
import { AdminTable } from '@/components/admin/AdminTable';
import { Badge } from '@/components/ui/Badge';
import { DeleteButton } from '@/components/admin/DeleteButton';
import type { Leadership } from '@/types/db';

export const dynamic = 'force-dynamic';

export default async function AdminLeadershipPage({
  searchParams,
}: {
  searchParams?: { search?: string };
}) {
  await requireAdminPageSession();
  const list = await listAllLeadership();
  const search = (searchParams?.search ?? '').toLowerCase().trim();
  const filtered = search
    ? list.filter((l) => l.name.toLowerCase().includes(search) || l.role.toLowerCase().includes(search))
    : list;

  return (
    <div>
      <AdminListHeader title="Leadership" description="Founding members, board, and working group." newHref="/admin/leadership/new" newLabel="New leader" />
      <div className="mb-4">
        <AdminSearchForm action="/admin/leadership" defaultValue={search} placeholder="Search name or role…" clearHref="/admin/leadership" />
      </div>
      <AdminTable<Leadership>
        rows={filtered}
        rowKey={(l) => l.id}
        columns={[
          { header: 'Name', cell: (l) => <Link href={`/admin/leadership/${l.id}`} className="font-medium text-indigo hover:text-saffron">{l.name}</Link> },
          { header: 'Role', cell: (l) => l.role },
          { header: 'Section', cell: (l) => l.section },
          { header: 'Order', cell: (l) => l.display_order },
          { header: 'Active', cell: (l) => l.active ? <Badge variant="indigo">Active</Badge> : <Badge variant="gray">Hidden</Badge> },
          { header: 'Actions', cell: (l) => (
            <div className="flex items-center gap-2">
              <Link href={`/admin/leadership/${l.id}`} className="text-xs text-indigo hover:text-saffron px-2 py-2 min-h-[36px] inline-flex items-center">Edit</Link>
              <DeleteButton resourcePath={`/api/admin/leadership/${l.id}`} />
            </div>
          ) },
        ]}
      />
    </div>
  );
}
