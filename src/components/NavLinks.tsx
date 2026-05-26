"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavLink {
  href: string;
  label: string;
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DesktopNavLinks({ links }: { links: readonly NavLink[] }) {
  const pathname = usePathname() ?? "/";
  return (
    <>
      {links.map((link) => {
        const active = isActive(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "px-3 py-2 text-sm font-medium text-saffron border-b border-saffron/40 transition-colors"
                : "px-3 py-2 text-sm font-medium text-indigo border-b border-transparent hover:text-saffron transition-colors"
            }
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}

export function MobileNavLinks({ links }: { links: readonly NavLink[] }) {
  const pathname = usePathname() ?? "/";
  return (
    <>
      {links.map((link) => {
        const active = isActive(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "block px-4 py-3 text-base font-medium text-saffron rounded-lg bg-cream"
                : "block px-4 py-3 text-base font-medium text-indigo rounded-lg hover:text-saffron hover:bg-cream"
            }
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}
