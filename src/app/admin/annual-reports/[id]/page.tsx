import { notFound } from 'next/navigation';
import { requireAdminPageSession } from '@/lib/adminSession';
import { getAnnualReportById } from '@/lib/queries/admin/annualReports';
import { AnnualReportForm } from '@/components/admin/forms/AnnualReportForm';
import { DeleteButton } from '@/components/admin/DeleteButton';

export const dynamic = 'force-dynamic';

export default async function EditAnnualReportPage({ params }: { params: { id: string } }) {
  await requireAdminPageSession();
  const r = await getAnnualReportById(params.id);
  if (!r) notFound();
  return (
    <div>
      <AnnualReportForm existing={r} />
      <div className="mt-8 pt-6 border-t border-gray-200 max-w-3xl">
        <p className="text-xs uppercase tracking-wider text-warm-gray mb-2">Danger zone</p>
        <DeleteButton resourcePath={`/api/admin/annual-reports/${r.id}`} label="Delete this report" onDeletedHref="/admin/annual-reports" />
      </div>
    </div>
  );
}
