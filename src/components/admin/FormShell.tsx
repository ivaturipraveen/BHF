'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { adminFetch } from '@/lib/adminClient';

interface Props<TValues extends Record<string, unknown>> {
  resource: string;
  recordId?: string;
  initialValues: TValues;
  buildPayload: (values: TValues) => unknown;
  endpoint: { method: 'POST' | 'PATCH'; path: string };
  redirectTo?: string;
  title: string;
  description?: string;
  children: (state: {
    values: TValues;
    setField: <K extends keyof TValues>(name: K, value: TValues[K]) => void;
    setValues: (next: TValues) => void;
  }) => React.ReactNode;
}

export function FormShell<TValues extends Record<string, unknown>>({
  resource,
  recordId,
  initialValues,
  buildPayload,
  endpoint,
  redirectTo,
  title,
  description,
  children,
}: Props<TValues>) {
  const router = useRouter();
  const draftKey = `admin-draft-${resource}-${recordId ?? 'new'}`;
  const [values, setValues] = useState<TValues>(initialValues);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    try {
      const stored = sessionStorage.getItem(draftKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setValues((prev) => ({ ...prev, ...parsed }));
      }
    } catch { /* ignore */ }
  }, [draftKey]);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      sessionStorage.setItem(draftKey, JSON.stringify(values));
    } catch { /* ignore */ }
  }, [values, draftKey]);

  function setField<K extends keyof TValues>(name: K, value: TValues[K]) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await adminFetch(endpoint.path, {
        method: endpoint.method,
        json: buildPayload(values),
      });
      if (!res.ok) {
        let msg = `Request failed (${res.status}).`;
        try {
          const data = await res.json();
          if (data?.error) msg = data.error;
          if (data?.details?.fieldErrors) {
            const flat = Object.entries(data.details.fieldErrors)
              .map(([k, v]) => `${k}: ${(v as string[]).join(', ')}`)
              .join('; ');
            if (flat) msg = `${msg} — ${flat}`;
          }
        } catch { /* ignore */ }
        setError(msg);
        setBusy(false);
        return;
      }
      try { sessionStorage.removeItem(draftKey); } catch { /* ignore */ }
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.refresh();
      }
    } catch (err) {
      setError((err as Error).message || 'Network error.');
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-3xl text-indigo">{title}</h1>
        {description && <p className="text-sm text-warm-gray mt-1">{description}</p>}
      </div>
      {children({ values, setField, setValues })}
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={busy}>
          {busy ? 'Saving…' : 'Save'}
        </Button>
        <button
          type="button"
          onClick={() => (typeof window !== 'undefined' ? window.history.back() : null)}
          className="px-6 py-3 text-sm font-medium text-warm-gray hover:text-indigo min-h-[44px]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
