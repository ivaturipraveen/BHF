"use client";

import * as React from "react";

export function FlashBanner({ storageKey }: { storageKey: string }) {
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      const m = window.sessionStorage.getItem(storageKey);
      if (m) {
        setMessage(m);
        window.sessionStorage.removeItem(storageKey);
      }
    } catch {
      // ignore
    }
  }, [storageKey]);

  if (!message) return null;

  return (
    <div
      role="status"
      className="rounded-lg border border-saffron/40 bg-saffron/10 px-4 py-3 text-sm text-indigo"
    >
      {message}
    </div>
  );
}
