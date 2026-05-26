"use client";

import * as React from "react";
import { Search, X } from "lucide-react";

export function SiteSearchButton() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search the site"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-indigo hover:bg-cream focus-visible:ring-2 focus-visible:ring-saffron/40 focus-visible:ring-offset-2 min-h-[44px] min-w-[44px]"
      >
        <Search size={18} />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Site search"
          className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-8 bg-indigo/40"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-xl rounded-2xl bg-white border border-gray-200 p-6 mt-16">
            <div className="flex items-center gap-3 mb-4">
              <Search size={20} className="text-saffron" />
              <input
                type="search"
                autoFocus
                placeholder="Search BHF…"
                className="flex-1 bg-transparent text-indigo placeholder:text-warm-gray/60 focus:outline-none text-lg"
                aria-label="Search BHF"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close search"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-warm-gray hover:bg-cream min-h-[44px] min-w-[44px]"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-warm-gray border-t border-gray-100 pt-4">
              Site search coming soon. In the meantime, use Find on this page
              (Cmd+F / Ctrl+F).
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
