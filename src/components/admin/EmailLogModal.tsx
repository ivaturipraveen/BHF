'use client';

import { useState } from 'react';

export interface EmailLogEntry {
  id: string;
  to_email: string;
  subject: string;
  kind: string;
  body_text: string | null;
  sent_at: Date | string;
}

interface Props {
  emails: EmailLogEntry[];
}

function formatDate(d: Date | string): string {
  return new Date(d).toLocaleString();
}

export function EmailLogTable({ emails }: Props) {
  const [open, setOpen] = useState<EmailLogEntry | null>(null);
  return (
    <>
      <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Sent at', 'To', 'Kind', 'Subject'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-warm-gray">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {emails.length === 0 ? (
              <tr><td colSpan={4} className="p-4 text-sm text-warm-gray">No emails sent yet.</td></tr>
            ) : emails.map((e) => (
              <tr key={e.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setOpen(e)}>
                <td className="px-4 py-3 text-sm text-indigo">{formatDate(e.sent_at)}</td>
                <td className="px-4 py-3 text-sm text-indigo">{e.to_email}</td>
                <td className="px-4 py-3 text-sm text-warm-gray">{e.kind}</td>
                <td className="px-4 py-3 text-sm text-indigo">{e.subject}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setOpen(null)}
        >
          <div
            className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-auto p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-xl text-indigo">{open.subject}</h2>
                <p className="text-xs text-warm-gray mt-1">{open.to_email} · {open.kind} · {formatDate(open.sent_at)}</p>
              </div>
              <button onClick={() => setOpen(null)} className="text-warm-gray hover:text-indigo text-xl leading-none">×</button>
            </div>
            <div className="mt-3 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs px-3 py-2">
              Dev log only — Phase 7 will replace with Resend.
            </div>
            <pre className="mt-4 whitespace-pre-wrap text-sm text-warm-gray bg-gray-50 rounded p-4 font-mono">{open.body_text ?? '(no body)'}</pre>
          </div>
        </div>
      )}
    </>
  );
}
