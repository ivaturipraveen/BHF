"use client";

import * as React from "react";
import { Menu, X } from "lucide-react";

export function NavbarMobileMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="lg:hidden inline-flex h-11 w-11 items-center justify-center rounded-lg text-indigo hover:text-saffron focus:outline-none focus-visible:ring-2 focus-visible:ring-saffron"
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>
      {open ? (
        <div className="lg:hidden fixed inset-0 top-24 bg-cream z-30 overflow-y-auto">
          <div className="flex justify-end px-4 pt-4">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-indigo hover:text-saffron focus:outline-none focus-visible:ring-2 focus-visible:ring-saffron"
            >
              <X size={28} />
            </button>
          </div>
          <div
            className="max-w-7xl mx-auto px-6 pb-12"
            onClick={() => setOpen(false)}
          >
            {children}
          </div>
        </div>
      ) : null}
    </>
  );
}
