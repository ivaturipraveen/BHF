import Link from 'next/link';
import { requireAdminPageSession } from '@/lib/adminSession';
import { listAllPhotoSubmissions } from '@/lib/queries/admin/photoSubmissions';
import { AdminListHeader } from '@/components/admin/AdminListHeader';
import { AdminTable } from '@/components/admin/AdminTable';
import { Badge } from '@/components/ui/Badge';
import { PhotoSubmissionActions } from '@/components/admin/PhotoSubmissionActions';
import type { PhotoSubmission } from '@/types/db';

export const dynamic = 'force-dynamic';

function formatDate(d: Date | null | undefined): string {
  if (!d) return '—';
  return new Date(d).toLocaleString();
}

export default async function AdminPhotoSubmissionsPage({
  searchParams,
}: {
  searchParams?: { status?: string };
}) {
  await requireAdminPageSession();
  const status = searchParams?.status ?? 'pending';
  const submissions = await listAllPhotoSubmissions(status);

  return (
    <div>
      <AdminListHeader title="Photo submissions" description="Community-submitted photos awaiting review." />
      <div className="mb-4 flex gap-1 text-xs">
        {['pending', 'approved', 'rejected'].map((s) => (
          <Link
            key={s}
            href={`/admin/photo-submissions?status=${s}`}
            className={`px-3 py-2 min-h-[36px] rounded ${status === s ? 'bg-indigo text-white' : 'bg-white border border-gray-200 text-indigo'}`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Link>
        ))}
      </div>
      <AdminTable<PhotoSubmission>
        rows={submissions}
        rowKey={(p) => p.id}
        emptyMessage={`No ${status} submissions.`}
        columns={[
          { header: 'Photo', cell: (p) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.file_url} alt="" className="h-16 w-24 object-cover rounded border border-gray-200" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
          ) },
          { header: 'Submitter', cell: (p) => (
            <div>
              <p className="text-indigo">{p.submitter_name ?? '—'}</p>
              <p className="text-xs text-warm-gray">{p.submitter_email ?? ''}</p>
            </div>
          ) },
          { header: 'Caption', cell: (p) => <span className="text-xs text-warm-gray">{p.caption ?? '—'}</span> },
          { header: 'Submitted', cell: (p) => formatDate(p.created_at) },
          { header: 'Status', cell: (p) => <Badge variant={p.status === 'approved' ? 'indigo' : p.status === 'rejected' ? 'amber' : 'saffron'}>{p.status}</Badge> },
          { header: 'Actions', cell: (p) => p.status === 'pending'
            ? <PhotoSubmissionActions id={p.id} />
            : <span className="text-xs text-warm-gray">{p.review_note ?? '—'}</span> },
        ]}
      />
    </div>
  );
}
