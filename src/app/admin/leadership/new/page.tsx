import { requireAdminPageSession } from '@/lib/adminSession';
import { LeadershipForm } from '@/components/admin/forms/LeadershipForm';

export const dynamic = 'force-dynamic';

export default async function NewLeaderPage() {
  await requireAdminPageSession();
  return <LeadershipForm />;
}
