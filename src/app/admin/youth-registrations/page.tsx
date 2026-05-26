import Link from 'next/link';
import { requireAdminPageSession } from '@/lib/adminSession';
import {
  listAllEnrollments,
  listEnrollmentsByProgram,
  type YouthEnrollmentRow,
} from '@/lib/queries/admin/youthRegistrations';
import { listAllPrograms } from '@/lib/queries/admin/programs';
import { AdminListHeader } from '@/components/admin/AdminListHeader';
import { AdminTable } from '@/components/admin/AdminTable';
import { differenceInYears } from 'date-fns';

export const dynamic = 'force-dynamic';

function formatDate(d: Date | null | undefined): string {
  if (!d) return '—';
  return new Date(d).toLocaleString();
}

function ageOf(dob: Date | null | undefined): string {
  if (!dob) return '—';
  return String(differenceInYears(new Date(), new Date(dob)));
}

export default async function AdminYouthRegistrationsPage({
  searchParams,
}: {
  searchParams?: { program_id?: string; show_audit?: string };
}) {
  await requireAdminPageSession();
  const programs = await listAllPrograms();
  const youthPrograms = programs.filter((p) => p.is_youth || p.category === 'youth');
  const enrollments = searchParams?.program_id
    ? await listEnrollmentsByProgram(searchParams.program_id)
    : await listAllEnrollments();
  const showAudit = searchParams?.show_audit === '1';

  const csvHref = `/api/admin/youth-registrations?format=csv${searchParams?.program_id ? `&program_id=${searchParams.program_id}` : ''}`;

  return (
    <div>
      <AdminListHeader
        title="Youth enrollments"
        description="Children registered for youth programs. Sensitive — handle with care."
        extra={
          <a href={csvHref} className="inline-flex items-center px-4 h-11 min-h-[44px] rounded-full border border-indigo text-indigo text-sm font-semibold hover:bg-cream">
            Export CSV
          </a>
        }
      />
      <form method="GET" className="mb-4 flex flex-wrap items-end gap-2 text-sm">
        <select name="program_id" defaultValue={searchParams?.program_id ?? ''} className="h-10 rounded-md border border-gray-300 bg-white px-2">
          <option value="">All youth programs</option>
          {youthPrograms.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
        {showAudit && <input type="hidden" name="show_audit" value="1" />}
        <button type="submit" className="h-10 min-h-[44px] px-4 rounded-md bg-indigo text-white">Filter</button>
        <Link href="/admin/youth-registrations" className="h-10 min-h-[44px] inline-flex items-center px-4 text-warm-gray">Clear</Link>
        {!showAudit && (
          <Link
            href={{ pathname: '/admin/youth-registrations', query: { ...(searchParams?.program_id ? { program_id: searchParams.program_id } : {}), show_audit: '1' } }}
            className="h-10 min-h-[44px] inline-flex items-center px-4 text-xs text-warm-gray hover:text-indigo underline"
          >
            Show audit columns
          </Link>
        )}
      </form>
      <AdminTable<YouthEnrollmentRow>
        rows={enrollments}
        rowKey={(r) => r.id}
        columns={[
          { header: 'Child', cell: (r) => <span className="text-indigo font-medium">{r.child_first_name} {r.child_last_name}</span> },
          { header: 'Age', cell: (r) => ageOf(r.child_date_of_birth) },
          { header: 'Program', cell: (r) => r.program_title ?? '—' },
          { header: 'Parent', cell: (r) => (
            <div>
              <p className="text-indigo">{r.parent_first_name} {r.parent_last_name}</p>
              <p className="text-xs text-warm-gray">{r.parent_email}</p>
            </div>
          ) },
          { header: 'Consented', cell: (r) => formatDate(r.parental_consent_at) },
          { header: 'Status', cell: (r) => r.status },
        ]}
      />
      {showAudit && (
        <p className="mt-4 text-xs text-warm-gray italic">
          Audit columns shown. IP and user agent are only displayed for compliance review.
        </p>
      )}
    </div>
  );
}
