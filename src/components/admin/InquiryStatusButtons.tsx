'use client';

import { useState } from 'react';
import { adminFetch } from '@/lib/adminClient';

interface Props {
  id: string;
  status: string;
}

export function InquiryStatusButtons({ id, status }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function update(next: 'contacted' | 'closed') {
    setBusy(true);
    setError(null);
    const res = await adminFetch(`/api/admin/contact-inquiries/${id}`, {
      method: 'PATCH',
      json: { status: next },
    });
    if (res.ok) {
      window.location.reload();
      return;
    }
    setError('Update failed.');
    setBusy(false);
  }

  return (
    <div className="flex items-center gap-2">
      {status !== 'contacted' && status !== 'closed' && (
        <button type="button" onClick={() => update('contacted')} disabled={busy} className="text-xs px-3 py-2 min-h-[36px] rounded-md bg-saffron text-white font-medium">
          Mark contacted
        </button>
      )}
      {status !== 'closed' && (
        <button type="button" onClick={() => update('closed')} disabled={busy} className="text-xs px-3 py-2 min-h-[36px] rounded-md bg-indigo text-white font-medium">
          Mark closed
        </button>
      )}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
