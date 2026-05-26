"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function StickyDonateBar() {
  const pathname = usePathname() ?? "/";
  const [show, setShow] = React.useState(false);

  const hidden =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/account") ||
    pathname.startsWith("/donate") ||
    pathname.startsWith("/login");

  React.useEffect(() => {
    if (hidden) {
      setShow(false);
      return;
    }
    function onScroll() {
      setShow(window.scrollY > 600);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hidden]);

  if (hidden) return null;

  return (
    <div
      aria-hidden={!show}
      className={`lg:hidden fixed inset-x-0 bottom-0 z-40 transition-transform duration-300 ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <Link
        href="/donate"
        className="flex items-center justify-center w-full h-14 bg-saffron text-white font-semibold text-base hover:bg-amber-burnt"
      >
        Donate today →
      </Link>
    </div>
  );
}
