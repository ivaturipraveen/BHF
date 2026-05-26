"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown, LayoutDashboard, Settings, LogOut } from "lucide-react";

export interface SessionMenuProps {
  firstName: string;
  lastName: string;
}

function initials(first: string, last: string): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

async function doSignOut() {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch {
    // ignore
  }
  window.location.assign("/");
}

export function SessionMenu({ firstName, lastName }: SessionMenuProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${firstName}`}
        className="inline-flex items-center gap-2 rounded-full pl-2 pr-3 py-1 text-sm font-medium text-indigo hover:bg-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-saffron"
      >
        <span
          aria-hidden
          className="h-9 w-9 rounded-full bg-saffron text-white font-semibold flex items-center justify-center"
        >
          {initials(firstName, lastName)}
        </span>
        <span className="hidden md:inline">{firstName}</span>
        <ChevronDown size={14} />
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg p-2 z-50"
        >
          <Link
            href="/account"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-indigo hover:bg-cream"
          >
            <LayoutDashboard size={16} />
            Dashboard
          </Link>
          <Link
            href="/account/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-indigo hover:bg-cream"
          >
            <Settings size={16} />
            Profile
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={doSignOut}
            className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-indigo hover:bg-cream"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
