import { requireAdminPageSession } from '@/lib/adminSession';
import { EventForm } from '@/components/admin/forms/EventForm';

export const dynamic = 'force-dynamic';

export default async function NewEventPage() {
  await requireAdminPageSession();
  return <EventForm />;
}
