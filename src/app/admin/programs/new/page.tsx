import { requireAdminPageSession } from '@/lib/adminSession';
import { ProgramForm } from '@/components/admin/forms/ProgramForm';

export const dynamic = 'force-dynamic';

export default async function NewProgramPage() {
  await requireAdminPageSession();
  return <ProgramForm />;
}
