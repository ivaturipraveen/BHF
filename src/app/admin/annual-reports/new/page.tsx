import { requireAdminPageSession } from '@/lib/adminSession';
import { AnnualReportForm } from '@/components/admin/forms/AnnualReportForm';

export const dynamic = 'force-dynamic';

export default async function NewAnnualReportPage() {
  await requireAdminPageSession();
  return <AnnualReportForm />;
}
