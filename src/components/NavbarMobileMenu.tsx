"use client";

import * as React from "react";
import { Menu, X } from "lucide-react";

export function NavbarMobileMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

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
        <div className="lg:hidden absolute left-0 right-0 top-full bg-white border-t border-gray-200">
          <div
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            onClick={() => setOpen(false)}
          >
            {children}
          </div>
        </div>
      ) : null}
    </>
  );
}
