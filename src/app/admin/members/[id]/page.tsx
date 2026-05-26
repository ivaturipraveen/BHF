import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdminPageSession } from '@/lib/adminSession';
import { getMemberById } from '@/lib/queries/admin/members';
import { listMyDonations, listMyRsvps, listMyChildren } from '@/lib/queries/account';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MemberSuspendButtons } from '@/components/admin/MemberSuspendButtons';

export const dynamic = 'force-dynamic';

function formatDate(d: Date | null | undefined): string {
  if (!d) return '—';
  return new Date(d).toLocaleString();
}

function formatCents(c: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(c / 100);
}

export default async function AdminMemberDetailPage({ params }: { params: { id: string } }) {
  const session = await requireAdminPageSession();
  const member = await getMemberById(params.id);
  if (!member) notFound();
  const [donations, rsvps, children] = await Promise.all([
    listMyDonations(member.id),
    listMyRsvps(member.id),
    listMyChildren(member.id),
  ]);
  const canManage = session.role === 'super_admin';

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/members" className="text-xs text-warm-gray hover:text-indigo">← Back to members</Link>
        <div className="flex items-end justify-between flex-wrap gap-3 mt-1">
          <h1 className="font-display text-3xl text-indigo">
            {member.first_name} {member.last_name}
          </h1>
          {canManage && (
            <MemberSuspendButtons memberId={member.id} suspended={member.suspended_at != null} />
          )}
        </div>
      </div>

      <Card>
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <dt className="text-warm-gray">Email</dt>
            <dd className="text-indigo">{member.email}</dd>
          </div>
          <div>
            <dt className="text-warm-gray">Phone</dt>
            <dd className="text-indigo">{member.phone ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-warm-gray">City</dt>
            <dd className="text-indigo">{member.city ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-warm-gray">Joined</dt>
            <dd className="text-indigo">{formatDate(member.created_at)}</dd>
          </div>
          <div>
            <dt className="text-warm-gray">Email verified</dt>
            <dd className="text-indigo">{member.email_verified_at ? formatDate(member.email_verified_at) : 'No'}</dd>
          </div>
          <div>
            <dt className="text-warm-gray">Status</dt>
            <dd>
              {member.suspended_at ? <Badge variant="amber">Suspended</Badge> : <Badge variant="indigo">Active</Badge>}
            </dd>
          </div>
          <div className="col-span-full">
            <dt className="text-warm-gray">Bio</dt>
            <dd className="text-indigo whitespace-pre-wrap">{member.bio ?? '—'}</dd>
          </div>
        </dl>
      </Card>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-warm-gray mb-2">RSVPs ({rsvps.length})</h2>
        <Card>
          {rsvps.length === 0 ? <p className="text-sm text-warm-gray">No RSVPs.</p> : (
            <ul className="divide-y divide-gray-100">
              {rsvps.map((r) => (
                <li key={r.id} className="py-2 text-sm">
                  <span className="text-indigo font-medium">{r.event_title ?? '(event)'}</span>
                  <span className="text-warm-gray ml-2">{r.event_starts_at ? formatDate(r.event_starts_at) : ''}</span>
                  <span className="text-warm-gray ml-2">party of {r.party_size}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-warm-gray mb-2">Donations ({donations.length})</h2>
        <Card>
          {donations.length === 0 ? <p className="text-sm text-warm-gray">No donations.</p> : (
            <ul className="divide-y divide-gray-100">
              {donations.map((d) => (
                <li key={d.id} className="py-2 text-sm flex items-center justify-between">
                  <span>
                    <span className="text-indigo font-medium">{formatCents(d.amount_cents)}</span>
                    <span className="text-warm-gray ml-2">{d.type}</span>
                    <span className="text-warm-gray ml-2">{formatDate(d.created_at)}</span>
                  </span>
                  <Badge variant={d.status === 'succeeded' ? 'indigo' : 'gray'}>{d.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-warm-gray mb-2">Children ({children.length})</h2>
        <Card>
          {children.length === 0 ? <p className="text-sm text-warm-gray">No children registered.</p> : (
            <ul className="divide-y divide-gray-100">
              {children.map((c) => (
                <li key={c.id} className="py-2 text-sm">
                  <span className="text-indigo font-medium">{c.first_name} {c.last_name}</span>
                  <span className="text-warm-gray ml-2">DOB {formatDate(c.date_of_birth)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>
    </div>
  );
}
