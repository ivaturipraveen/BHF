"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

export interface ProgramsMegaMenuColumn {
  category: "Cultural" | "Educational" | "Charitable" | "Wellness" | "Youth";
  programs: { slug: string; title: string }[];
}

export interface ProgramsMegaMenuProps {
  columns: ProgramsMegaMenuColumn[];
}

export function ProgramsMegaMenu({ columns }: ProgramsMegaMenuProps) {
  const pathname = usePathname() ?? "/";
  const active = pathname === "/programs" || pathname.startsWith("/programs/");
  const [open, setOpen] = React.useState(false);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  function scheduleClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  }

  function cancelClose() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  React.useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
      onFocus={() => {
        cancelClose();
        setOpen(true);
      }}
      onBlur={(e) => {
        if (!wrapperRef.current?.contains(e.relatedTarget as Node | null)) {
          scheduleClose();
        }
      }}
    >
      <Link
        href="/programs"
        aria-haspopup="true"
        aria-expanded={open}
        aria-current={active ? "page" : undefined}
        className={
          active
            ? "inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-saffron border-b border-saffron/40 transition-colors"
            : "inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-indigo border-b border-transparent hover:text-saffron transition-colors"
        }
      >
        Programs
        <ChevronDown size={14} aria-hidden="true" />
      </Link>

      {open ? (
        <div
          role="menu"
          aria-label="Programs"
          className="absolute left-1/2 top-full -translate-x-1/2 mt-2 w-[min(1000px,90vw)] bg-cream rounded-2xl border border-saffron/30 p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 z-50"
        >
          {columns.map((col) => (
            <div key={col.category}>
              <h3 className="font-display text-sm text-indigo uppercase tracking-wider mb-3">
                {col.category}
              </h3>
              <ul className="space-y-2">
                {col.programs.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={`/programs/${p.slug}`}
                      onClick={() => setOpen(false)}
                      className="text-sm text-warm-gray hover:text-saffron transition-colors"
                    >
                      {p.title}
                    </Link>
                  </li>
                ))}
                {col.programs.length === 0 ? (
                  <li>
                    <span className="text-sm text-warm-gray/70">
                      Coming soon
                    </span>
                  </li>
                ) : null}
              </ul>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
