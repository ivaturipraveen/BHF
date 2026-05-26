'use client';

import { useState } from 'react';
import { adminFetch } from '@/lib/adminClient';

interface Props {
  memberId: string;
  suspended: boolean;
}

export function MemberSuspendButtons({ memberId, suspended }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const action = suspended ? 'unsuspend' : 'suspend';
  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={async () => {
          if (!confirm(`${suspended ? 'Unsuspend' : 'Suspend'} this member?`)) return;
          setBusy(true);
          setError(null);
          const res = await adminFetch(`/api/admin/members/${memberId}/${action}`, { method: 'POST' });
          if (res.ok) {
            window.location.reload();
            return;
          }
          setError('Action failed.');
          setBusy(false);
        }}
        disabled={busy}
        className={`text-xs px-3 py-2 min-h-[36px] rounded-md font-medium ${suspended ? 'bg-indigo text-white' : 'bg-red-50 text-red-700'}`}
      >
        {busy ? '…' : suspended ? 'Unsuspend' : 'Suspend'}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
