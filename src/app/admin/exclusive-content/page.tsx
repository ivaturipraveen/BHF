import Link from 'next/link';
import { requireAdminPageSession } from '@/lib/adminSession';
import { listAllExclusiveContent } from '@/lib/queries/admin/exclusiveContent';
import { AdminListHeader } from '@/components/admin/AdminListHeader';
import { AdminTable } from '@/components/admin/AdminTable';
import { Badge } from '@/components/ui/Badge';
import { DeleteButton } from '@/components/admin/DeleteButton';
import type { ExclusiveContent } from '@/types/db';

export const dynamic = 'force-dynamic';

function formatDate(d: Date | null | undefined): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString();
}

export default async function AdminExclusiveContentPage() {
  await requireAdminPageSession();
  const items = await listAllExclusiveContent();
  return (
    <div>
      <AdminListHeader title="Exclusive content" description="Members-only videos, PDFs, and audio." newHref="/admin/exclusive-content/new" newLabel="New content" />
      <AdminTable<ExclusiveContent>
        rows={items}
        rowKey={(c) => c.id}
        columns={[
          { header: 'Title', cell: (c) => <Link href={`/admin/exclusive-content/${c.id}`} className="font-medium text-indigo hover:text-saffron">{c.title}</Link> },
          { header: 'Category', cell: (c) => c.category },
          { header: 'Type', cell: (c) => <Badge variant="indigo">{c.content_type}</Badge> },
          { header: 'Published', cell: (c) => formatDate(c.published_at) },
          { header: 'Actions', cell: (c) => (
            <div className="flex items-center gap-2">
              <Link href={`/admin/exclusive-content/${c.id}`} className="text-xs text-indigo hover:text-saffron px-2 py-2 min-h-[36px] inline-flex items-center">Edit</Link>
              <DeleteButton resourcePath={`/api/admin/exclusive-content/${c.id}`} />
            </div>
          ) },
        ]}
      />
    </div>
  );
}
