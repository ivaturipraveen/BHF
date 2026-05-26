'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { Textarea } from '@/components/ui/Textarea';

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  hint?: string;
  required?: boolean;
}

export function MarkdownField({ label, value, onChange, rows = 10, hint, required }: Props) {
  const [preview, setPreview] = useState(false);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setPreview((p) => !p)}
          className="text-xs text-saffron hover:text-amber-burnt underline"
        >
          {preview ? 'Edit' : 'Preview'}
        </button>
      </div>
      {preview ? (
        <div className="min-h-[200px] rounded-md border border-gray-200 bg-white p-4 prose max-w-none">
          <label className="block text-sm font-medium text-indigo mb-2">{label} (preview)</label>
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
            {value || '_Nothing to preview._'}
          </ReactMarkdown>
        </div>
      ) : (
        <Textarea
          label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          hint={hint}
          required={required}
          className="font-mono text-sm"
        />
      )}
    </div>
  );
}
