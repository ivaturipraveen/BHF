import { requireAdminPageSession } from '@/lib/adminSession';
import { SponsorForm } from '@/components/admin/forms/SponsorForm';

export const dynamic = 'force-dynamic';

export default async function NewSponsorPage() {
  await requireAdminPageSession();
  return <SponsorForm />;
}
