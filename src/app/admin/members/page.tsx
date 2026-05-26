import Link from 'next/link';
import { requireAdminPageSession } from '@/lib/adminSession';
import { listAllMembers } from '@/lib/queries/admin/members';
import { AdminListHeader } from '@/components/admin/AdminListHeader';
import { AdminSearchForm } from '@/components/admin/AdminSearchForm';
import { AdminTable } from '@/components/admin/AdminTable';
import { Badge } from '@/components/ui/Badge';
import { MemberSuspendButtons } from '@/components/admin/MemberSuspendButtons';
import type { Member } from '@/types/db';

export const dynamic = 'force-dynamic';

function formatDate(d: Date | null | undefined): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString();
}

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams?: { search?: string; suspended?: string; page?: string };
}) {
  const session = await requireAdminPageSession();
  const page = Math.max(1, Number(searchParams?.page ?? '1'));
  const pageSize = 50;
  const search = (searchParams?.search ?? '').trim();
  const all = await listAllMembers({
    limit: pageSize,
    offset: (page - 1) * pageSize,
    search: search || undefined,
  });
  let filtered = all;
  if (searchParams?.suspended === 'true') {
    filtered = all.filter((m) => m.suspended_at != null);
  } else if (searchParams?.suspended === 'false') {
    filtered = all.filter((m) => m.suspended_at == null);
  }

  const canManage = session.role === 'super_admin';

  return (
    <div>
      <AdminListHeader
        title="Members"
        description="Registered community members."
        extra={
          <a
            href="/api/admin/members?format=csv"
            className="inline-flex items-center px-4 h-11 min-h-[44px] rounded-full border border-indigo text-indigo text-sm font-semibold hover:bg-cream"
          >
            Export CSV
          </a>
        }
      />
      <div className="mb-4 flex items-center gap-3 flex-wrap">
        <AdminSearchForm action="/admin/members" defaultValue={search} placeholder="Search name or email…" clearHref="/admin/members" />
        <div className="flex gap-1 text-xs">
          <Link href="/admin/members" className={`px-3 py-2 min-h-[36px] rounded ${!searchParams?.suspended ? 'bg-indigo text-white' : 'bg-white border border-gray-200 text-indigo'}`}>All</Link>
          <Link href="/admin/members?suspended=false" className={`px-3 py-2 min-h-[36px] rounded ${searchParams?.suspended === 'false' ? 'bg-indigo text-white' : 'bg-white border border-gray-200 text-indigo'}`}>Active</Link>
          <Link href="/admin/members?suspended=true" className={`px-3 py-2 min-h-[36px] rounded ${searchParams?.suspended === 'true' ? 'bg-indigo text-white' : 'bg-white border border-gray-200 text-indigo'}`}>Suspended</Link>
        </div>
      </div>
      <AdminTable<Member>
        rows={filtered}
        rowKey={(m) => m.id}
        columns={[
          { header: 'Name', cell: (m) => (
            <Link href={`/admin/members/${m.id}`} className="font-medium text-indigo hover:text-saffron">
              {m.first_name} {m.last_name}
            </Link>
          ) },
          { header: 'Email', cell: (m) => m.email },
          { header: 'City', cell: (m) => m.city ?? '—' },
          { header: 'Joined', cell: (m) => formatDate(m.created_at) },
          { header: 'Email verified', cell: (m) => m.email_verified_at ? 'Yes' : 'No' },
          { header: 'Directory', cell: (m) => m.directory_opt_in ? 'Opt-in' : '—' },
          { header: 'Status', cell: (m) => m.suspended_at ? <Badge variant="amber">Suspended</Badge> : <Badge variant="indigo">Active</Badge> },
          { header: 'Actions', cell: (m) => (
            <div className="flex items-center gap-2">
              <Link href={`/admin/members/${m.id}`} className="text-xs text-indigo hover:text-saffron px-2 py-2 min-h-[36px] inline-flex items-center">View</Link>
              {canManage && (
                <MemberSuspendButtons memberId={m.id} suspended={m.suspended_at != null} />
              )}
            </div>
          ) },
        ]}
      />
      <div className="mt-4 flex gap-2 text-sm">
        {page > 1 && (
          <Link href={{ pathname: '/admin/members', query: { ...(search ? { search } : {}), ...(searchParams?.suspended ? { suspended: searchParams.suspended } : {}), page: page - 1 } }} className="px-3 py-2 min-h-[36px] rounded-md bg-white border border-gray-200">
            ← Prev
          </Link>
        )}
        {filtered.length === pageSize && (
          <Link href={{ pathname: '/admin/members', query: { ...(search ? { search } : {}), ...(searchParams?.suspended ? { suspended: searchParams.suspended } : {}), page: page + 1 } }} className="px-3 py-2 min-h-[36px] rounded-md bg-white border border-gray-200">
            Next →
          </Link>
        )}
      </div>
    </div>
  );
}
