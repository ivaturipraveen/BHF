import Link from 'next/link';
import { requireAdminPageSession } from '@/lib/adminSession';
import { listAllPages } from '@/lib/queries/admin/pages';
import { AdminListHeader } from '@/components/admin/AdminListHeader';
import { AdminSearchForm } from '@/components/admin/AdminSearchForm';
import { AdminTable } from '@/components/admin/AdminTable';
import type { Page } from '@/types/db';

export const dynamic = 'force-dynamic';

function formatDate(d: Date | null | undefined): string {
  if (!d) return '—';
  return new Date(d).toLocaleString();
}

export default async function AdminPagesPage({
  searchParams,
}: {
  searchParams?: { search?: string };
}) {
  await requireAdminPageSession();
  const pages = await listAllPages();
  const search = (searchParams?.search ?? '').toLowerCase().trim();
  const filtered = search
    ? pages.filter((p) => p.slug.toLowerCase().includes(search) || (p.title ?? '').toLowerCase().includes(search))
    : pages;

  return (
    <div>
      <AdminListHeader title="Pages" description="Static pages like About, Privacy, Terms." />
      <div className="mb-4">
        <AdminSearchForm action="/admin/pages" defaultValue={search} placeholder="Search slug or title…" clearHref="/admin/pages" />
      </div>
      <AdminTable<Page>
        rows={filtered}
        rowKey={(p) => p.id}
        columns={[
          { header: 'Slug', cell: (p) => <Link href={`/admin/pages/${p.id}`} className="font-medium text-indigo hover:text-saffron">{p.slug}</Link> },
          { header: 'Title', cell: (p) => p.title ?? '—' },
          { header: 'Updated', cell: (p) => formatDate(p.updated_at) },
          { header: 'Actions', cell: (p) => (
            <Link href={`/admin/pages/${p.id}`} className="text-xs text-indigo hover:text-saffron px-2 py-2 min-h-[36px] inline-flex items-center">Edit</Link>
          ) },
        ]}
      />
    </div>
  );
}
