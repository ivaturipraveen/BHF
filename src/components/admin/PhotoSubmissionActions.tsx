'use client';

import { useState } from 'react';
import { adminFetch } from '@/lib/adminClient';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';

interface Props {
  id: string;
}

export function PhotoSubmissionActions({ id }: Props) {
  const [busy, setBusy] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function approve() {
    setBusy(true);
    setError(null);
    const res = await adminFetch(`/api/admin/photo-submissions/${id}/approve`, { method: 'POST', json: {} });
    if (res.ok) {
      window.location.reload();
      return;
    }
    setError('Approve failed.');
    setBusy(false);
  }

  async function reject() {
    setBusy(true);
    setError(null);
    const res = await adminFetch(`/api/admin/photo-submissions/${id}/reject`, {
      method: 'POST',
      json: note ? { note } : {},
    });
    if (res.ok) {
      window.location.reload();
      return;
    }
    setError('Reject failed.');
    setBusy(false);
  }

  if (rejecting) {
    return (
      <div className="space-y-2 w-full">
        <Textarea label="Reason for rejection (sent to submitter)" value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex gap-2">
          <Button type="button" onClick={reject} disabled={busy} variant="secondary" className="text-xs">
            {busy ? 'Rejecting…' : 'Confirm reject'}
          </Button>
          <Button type="button" onClick={() => setRejecting(false)} variant="ghost" className="text-xs">Cancel</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={approve} disabled={busy} className="text-xs px-3 py-2 min-h-[36px] rounded-md bg-saffron text-white font-medium">
        {busy ? '…' : 'Approve'}
      </button>
      <button type="button" onClick={() => setRejecting(true)} disabled={busy} className="text-xs px-3 py-2 min-h-[36px] rounded-md bg-red-50 text-red-700 font-medium">
        Reject
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
