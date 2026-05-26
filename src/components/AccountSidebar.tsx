"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  HeartHandshake,
  BookOpen,
  Settings,
  UsersRound,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

export interface SidebarMember {
  firstName: string;
  lastName: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV: NavItem[] = [
  { href: "/account", label: "Dashboard", icon: Home },
  { href: "/account/directory", label: "Member directory", icon: Users },
  {
    href: "/account/donations",
    label: "Donation history",
    icon: HeartHandshake,
  },
  { href: "/account/library", label: "Content library", icon: BookOpen },
  { href: "/account/profile", label: "Profile settings", icon: Settings },
  {
    href: "/account/children",
    label: "Children & enrollments",
    icon: UsersRound,
  },
];

function initials(first: string, last: string): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/account") return pathname === "/account";
  return pathname === href || pathname.startsWith(`${href}/`);
}

async function doSignOut() {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch {
    // ignore — still redirect
  }
  window.location.assign("/");
}

export function AccountSidebar({ member }: { member: SidebarMember }) {
  const pathname = usePathname() ?? "/account";

  return (
    <aside
      aria-label="Account navigation"
      className="md:sticky md:top-24 md:w-64 md:flex-shrink-0"
    >
      <div className="hidden md:block bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
          <div
            aria-hidden
            className="h-12 w-12 rounded-full bg-saffron text-white font-semibold flex items-center justify-center"
          >
            {initials(member.firstName, member.lastName)}
          </div>
          <div className="min-w-0">
            <p className="font-display text-indigo truncate">
              Namaste, {member.firstName}
            </p>
            <Link
              href="/account/profile"
              className="text-sm text-saffron hover:text-amber-burnt"
            >
              View profile
            </Link>
          </div>
        </div>

        <nav aria-label="Account sidebar" className="mt-4 flex flex-col gap-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-saffron/10 text-indigo"
                    : "text-warm-gray hover:bg-cream hover:text-indigo",
                )}
              >
                <Icon size={18} className={active ? "text-saffron" : ""} />
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={doSignOut}
            className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-warm-gray hover:bg-cream hover:text-indigo"
          >
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </nav>
      </div>

      {/* Mobile: horizontal scroll tabs */}
      <div className="md:hidden -mx-4 px-4 overflow-x-auto">
        <div className="flex items-center gap-2 pb-2">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium whitespace-nowrap",
                  active
                    ? "border-saffron bg-saffron/10 text-indigo"
                    : "border-gray-200 bg-white text-warm-gray",
                )}
              >
                <Icon size={14} />
                {item.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={doSignOut}
            className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-warm-gray whitespace-nowrap"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
