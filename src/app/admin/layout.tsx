import type { Metadata } from 'next';
import { getAdminSessionFromCookies } from '@/lib/adminSession';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminSignOutButton } from '@/components/admin/AdminSignOutButton';

export const metadata: Metadata = {
  title: 'Admin — BHF',
  robots: { index: false, follow: false },
};

// Plausible analytics is intentionally excluded from /admin (privacy: don't
// track admin behavior). Enforcement lives in src/app/layout.tsx, which reads
// the `x-pathname` header set by middleware and skips <PlausibleScript /> for
// any path starting with /admin.

export const dynamic = 'force-dynamic';

const ROLE_LABEL: Record<string, string> = {
  super_admin: 'Super admin',
  editor: 'Editor',
  contributor: 'Contributor',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSessionFromCookies();

  if (!session) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 flex items-center justify-between bg-white border-b border-gray-200 px-4 sm:px-6 h-14">
        <div className="flex items-center gap-3">
          <span className="font-display text-lg text-indigo">BHF</span>
          <span className="text-xs text-warm-gray uppercase tracking-wider">Admin</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-indigo">{session.email}</p>
            <p className="text-xs text-warm-gray">{ROLE_LABEL[session.role] ?? session.role}</p>
          </div>
          <AdminSignOutButton />
        </div>
      </header>
      <div className="flex">
        <AdminSidebar role={session.role} />
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
