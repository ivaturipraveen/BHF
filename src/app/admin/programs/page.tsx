import Link from 'next/link';
import { requireAdminPageSession } from '@/lib/adminSession';
import { listAllPrograms } from '@/lib/queries/admin/programs';
import { AdminListHeader } from '@/components/admin/AdminListHeader';
import { AdminSearchForm } from '@/components/admin/AdminSearchForm';
import { AdminTable } from '@/components/admin/AdminTable';
import { Badge } from '@/components/ui/Badge';
import { DeleteButton } from '@/components/admin/DeleteButton';
import type { Program } from '@/types/db';

export const dynamic = 'force-dynamic';

export default async function AdminProgramsPage({
  searchParams,
}: {
  searchParams?: { search?: string };
}) {
  await requireAdminPageSession();
  const programs = await listAllPrograms();
  const search = (searchParams?.search ?? '').toLowerCase().trim();
  const filtered = search
    ? programs.filter((p) =>
        p.title.toLowerCase().includes(search) ||
        p.slug.toLowerCase().includes(search) ||
        p.category.toLowerCase().includes(search),
      )
    : programs;

  return (
    <div>
      <AdminListHeader
        title="Programs"
        description="Ongoing cultural, educational, charitable, wellness, and youth programs."
        newHref="/admin/programs/new"
        newLabel="New program"
      />
      <div className="mb-4">
        <AdminSearchForm action="/admin/programs" defaultValue={search} placeholder="Search title, slug, category…" clearHref="/admin/programs" />
      </div>
      <AdminTable<Program>
        rows={filtered}
        rowKey={(p) => p.id}
        columns={[
          { header: 'Title', cell: (p) => (
            <div>
              <Link href={`/admin/programs/${p.id}`} className="font-medium text-indigo hover:text-saffron">{p.title}</Link>
              <p className="text-xs text-warm-gray">{p.slug}</p>
            </div>
          ) },
          { header: 'Category', cell: (p) => p.category },
          { header: 'Frequency', cell: (p) => p.frequency },
          { header: 'Youth?', cell: (p) => p.is_youth ? 'Yes' : 'No' },
          { header: 'Status', cell: (p) => <Badge variant={p.status === 'published' ? 'indigo' : 'gray'}>{p.status}</Badge> },
          { header: 'Actions', cell: (p) => (
            <div className="flex items-center gap-2">
              <Link href={`/admin/programs/${p.id}`} className="text-xs text-indigo hover:text-saffron px-2 py-2 min-h-[36px] inline-flex items-center">Edit</Link>
              <DeleteButton resourcePath={`/api/admin/programs/${p.id}`} />
            </div>
          ) },
        ]}
      />
    </div>
  );
}
