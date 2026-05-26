'use client';

import { useState } from 'react';
import { adminFetch } from '@/lib/adminClient';

export function AdminSignOutButton() {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await adminFetch('/api/admin/auth/logout', { method: 'POST' });
        } catch {
          /* ignore */
        }
        window.location.assign('/admin/login');
      }}
      className="text-sm text-warm-gray hover:text-indigo disabled:opacity-60 px-3 py-2 min-h-[44px]"
    >
      {busy ? 'Signing out…' : 'Sign out'}
    </button>
  );
}
