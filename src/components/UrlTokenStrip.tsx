'use client';

import { useEffect } from 'react';

export default function UrlTokenStrip({
  paramsToStrip = ['token', 'session_id'],
}: {
  paramsToStrip?: string[];
}) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    let changed = false;
    for (const p of paramsToStrip) {
      if (url.searchParams.has(p)) {
        url.searchParams.delete(p);
        changed = true;
      }
    }
    if (changed) {
      window.history.replaceState({}, '', url.toString());
    }
  }, [paramsToStrip]);
  return null;
}
