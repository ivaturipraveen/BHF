import { notFound } from 'next/navigation';
import { requireAdminPageSession } from '@/lib/adminSession';
import { getEventById } from '@/lib/queries/admin/events';
import { EventForm } from '@/components/admin/forms/EventForm';
import { DeleteButton } from '@/components/admin/DeleteButton';

export const dynamic = 'force-dynamic';

export default async function EditEventPage({ params }: { params: { id: string } }) {
  await requireAdminPageSession();
  const event = await getEventById(params.id);
  if (!event) notFound();

  return (
    <div>
      <EventForm existing={event} />
      <div className="mt-8 pt-6 border-t border-gray-200 max-w-3xl">
        <p className="text-xs uppercase tracking-wider text-warm-gray mb-2">Danger zone</p>
        <DeleteButton
          resourcePath={`/api/admin/events/${event.id}`}
          label="Delete this event"
          onDeletedHref="/admin/events"
          confirmMessage="Permanently delete this event?"
        />
      </div>
    </div>
  );
}
