'use client';

import { useState } from 'react';
import { adminFetch } from '@/lib/adminClient';

interface Props {
  resourcePath: string;
  label?: string;
  confirmMessage?: string;
  onDeletedHref?: string;
}

export function DeleteButton({ resourcePath, label = 'Delete', confirmMessage, onDeletedHref }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  async function doDelete() {
    setBusy(true);
    setError(null);
    try {
      const res = await adminFetch(resourcePath, { method: 'DELETE' });
      if (!res.ok) {
        let msg = 'Could not delete.';
        try {
          const data = await res.json();
          if (data?.error) msg = data.error;
        } catch { /* ignore */ }
        setError(msg);
        setBusy(false);
        return;
      }
      if (onDeletedHref) {
        window.location.assign(onDeletedHref);
      } else {
        window.location.reload();
      }
    } catch {
      setError('Network error.');
      setBusy(false);
    }
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex items-center px-3 py-2 min-h-[36px] text-xs font-medium text-red-700 hover:bg-red-50 rounded-md"
      >
        {label}
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-2">
      <span className="text-xs text-warm-gray">{confirmMessage ?? 'Are you sure?'}</span>
      <button
        type="button"
        onClick={doDelete}
        disabled={busy}
        className="inline-flex items-center px-3 py-2 min-h-[36px] text-xs font-medium bg-red-600 text-white rounded-md disabled:opacity-60"
      >
        {busy ? 'Deleting…' : 'Confirm'}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        disabled={busy}
        className="inline-flex items-center px-3 py-2 min-h-[36px] text-xs font-medium text-warm-gray rounded-md"
      >
        Cancel
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
