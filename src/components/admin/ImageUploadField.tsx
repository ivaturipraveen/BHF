'use client';

import { useRef, useState } from 'react';
import { uploadFile } from '@/lib/adminClient';
import { Input } from '@/components/ui/Input';

interface Props {
  label: string;
  name?: string;
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  hint?: string;
}

export function ImageUploadField({ label, name, value, onChange, accept = 'image/*', hint }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const out = await uploadFile(file);
      onChange(out.url);
    } catch (err) {
      setError((err as Error).message || 'Upload failed.');
    }
    setBusy(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div className="space-y-2">
      <Input
        label={label}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="/uploads/2026/05/..."
        hint={hint}
      />
      <div className="flex items-center gap-3">
        <input
          ref={fileRef}
          type="file"
          accept={accept}
          onChange={handlePick}
          disabled={busy}
          className="text-sm text-warm-gray file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-cream file:text-indigo hover:file:bg-saffron/20"
        />
        {busy && <span className="text-xs text-warm-gray">Uploading…</span>}
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
      {value && (
        <div className="mt-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="preview"
            className="max-h-32 rounded border border-gray-200"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      )}
    </div>
  );
}
