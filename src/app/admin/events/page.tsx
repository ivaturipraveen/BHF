import Link from 'next/link';
import { requireAdminPageSession } from '@/lib/adminSession';
import { listAllEvents } from '@/lib/queries/admin/events';
import { AdminListHeader } from '@/components/admin/AdminListHeader';
import { AdminSearchForm } from '@/components/admin/AdminSearchForm';
import { AdminTable } from '@/components/admin/AdminTable';
import { Badge } from '@/components/ui/Badge';
import { DeleteButton } from '@/components/admin/DeleteButton';
import type { Event } from '@/types/db';

export const dynamic = 'force-dynamic';

function statusVariant(status: string): 'saffron' | 'indigo' | 'gray' {
  if (status === 'published') return 'indigo';
  if (status === 'draft') return 'saffron';
  return 'gray';
}

function formatDateTime(d: Date | string | null | undefined): string {
  if (!d) return '—';
  return new Date(d).toLocaleString();
}

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams?: { search?: string; page?: string };
}) {
  await requireAdminPageSession();
  const events = await listAllEvents();
  const search = (searchParams?.search ?? '').toLowerCase().trim();
  const filtered = search
    ? events.filter((e) =>
        e.title.toLowerCase().includes(search) ||
        e.slug.toLowerCase().includes(search) ||
        (e.location_name ?? '').toLowerCase().includes(search),
      )
    : events;

  const page = Math.max(1, Number(searchParams?.page ?? '1'));
  const pageSize = 25;
  const start = (page - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  return (
    <div>
      <AdminListHeader
        title="Events"
        description="Festivals, classes, charity events, and youth gatherings."
        newHref="/admin/events/new"
        newLabel="New event"
      />
      <div className="mb-4">
        <AdminSearchForm
          action="/admin/events"
          defaultValue={search}
          placeholder="Search title, slug, or location…"
          clearHref="/admin/events"
        />
      </div>
      <AdminTable<Event>
        rows={paged}
        rowKey={(e) => e.id}
        emptyMessage="No events match your search."
        columns={[
          { header: 'Title', cell: (e) => (
            <div>
              <Link href={`/admin/events/${e.id}`} className="font-medium text-indigo hover:text-saffron">{e.title}</Link>
              <p className="text-xs text-warm-gray">{e.slug}</p>
            </div>
          ) },
          { header: 'Type', cell: (e) => e.type ?? '—' },
          { header: 'Status', cell: (e) => <Badge variant={statusVariant(e.status)}>{e.status}</Badge> },
          { header: 'Starts at', cell: (e) => formatDateTime(e.starts_at) },
          { header: 'Capacity', cell: (e) => e.rsvp_capacity ?? '—' },
          { header: 'Actions', cell: (e) => (
            <div className="flex items-center gap-2">
              <Link href={`/admin/events/${e.id}`} className="text-xs text-indigo hover:text-saffron px-2 py-2 min-h-[36px] inline-flex items-center">Edit</Link>
              <DeleteButton resourcePath={`/api/admin/events/${e.id}`} />
            </div>
          ) },
        ]}
      />
      {totalPages > 1 && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={{ pathname: '/admin/events', query: { ...(search ? { search } : {}), page: p } }}
              className={`px-3 py-2 min-h-[36px] rounded-md ${p === page ? 'bg-indigo text-white' : 'bg-white border border-gray-200 text-indigo hover:bg-cream'}`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
