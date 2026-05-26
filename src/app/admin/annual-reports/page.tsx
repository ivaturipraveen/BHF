import Link from 'next/link';
import { requireAdminPageSession } from '@/lib/adminSession';
import { listAllAnnualReports } from '@/lib/queries/admin/annualReports';
import { AdminListHeader } from '@/components/admin/AdminListHeader';
import { AdminTable } from '@/components/admin/AdminTable';
import { DeleteButton } from '@/components/admin/DeleteButton';
import type { AnnualReport } from '@/types/db';

export const dynamic = 'force-dynamic';

export default async function AdminAnnualReportsPage() {
  await requireAdminPageSession();
  const reports = await listAllAnnualReports();
  return (
    <div>
      <AdminListHeader title="Annual reports" newHref="/admin/annual-reports/new" newLabel="New report" />
      <AdminTable<AnnualReport>
        rows={reports}
        rowKey={(r) => r.id}
        columns={[
          { header: 'Year', cell: (r) => <Link href={`/admin/annual-reports/${r.id}`} className="font-medium text-indigo hover:text-saffron">{r.year}</Link> },
          { header: 'Title', cell: (r) => r.title ?? '—' },
          { header: 'PDF', cell: (r) => <a href={r.pdf_url} target="_blank" rel="noreferrer" className="text-xs text-saffron hover:text-amber-burnt underline">Download</a> },
          { header: 'Actions', cell: (r) => (
            <div className="flex items-center gap-2">
              <Link href={`/admin/annual-reports/${r.id}`} className="text-xs text-indigo hover:text-saffron px-2 py-2 min-h-[36px] inline-flex items-center">Edit</Link>
              <DeleteButton resourcePath={`/api/admin/annual-reports/${r.id}`} />
            </div>
          ) },
        ]}
      />
    </div>
  );
}
