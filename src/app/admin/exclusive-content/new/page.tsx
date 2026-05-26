import { requireAdminPageSession } from '@/lib/adminSession';
import { ExclusiveContentForm } from '@/components/admin/forms/ExclusiveContentForm';

export const dynamic = 'force-dynamic';

export default async function NewExclusiveContentPage() {
  await requireAdminPageSession();
  return <ExclusiveContentForm />;
}
