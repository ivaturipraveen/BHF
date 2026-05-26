import { requireAdminPageSession } from '@/lib/adminSession';
import { query } from '@/lib/db';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AdminProfileTotp } from '@/components/admin/AdminProfileTotp';
import type { Admin } from '@/types/db';

export const dynamic = 'force-dynamic';

const ROLE_LABEL: Record<string, string> = {
  super_admin: 'Super admin',
  editor: 'Editor',
  contributor: 'Contributor',
};

function formatDate(d: Date | null | undefined): string {
  if (!d) return '—';
  return new Date(d).toLocaleString();
}

export default async function AdminProfilePage() {
  const session = await requireAdminPageSession();
  const rows = await query<Admin>(
    `SELECT id, email, name, role, totp_enabled, last_login_at, created_at, updated_at
       FROM admins WHERE id = $1 LIMIT 1`,
    [session.sub],
  );
  const admin = rows[0];

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-3xl text-indigo">My profile</h1>
        <p className="text-sm text-warm-gray mt-1">Your account information and security settings.</p>
      </div>

      <Card>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div>
            <dt className="text-warm-gray">Name</dt>
            <dd className="text-indigo font-medium">{admin?.name ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-warm-gray">Email</dt>
            <dd className="text-indigo font-medium">{admin?.email ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-warm-gray">Role</dt>
            <dd>
              <Badge variant="indigo">{ROLE_LABEL[admin?.role ?? ''] ?? admin?.role ?? '—'}</Badge>
            </dd>
          </div>
          <div>
            <dt className="text-warm-gray">Last login</dt>
            <dd className="text-indigo font-medium">{formatDate(admin?.last_login_at)}</dd>
          </div>
        </dl>
      </Card>

      <AdminProfileTotp initialEnabled={admin?.totp_enabled ?? false} />
    </div>
  );
}
