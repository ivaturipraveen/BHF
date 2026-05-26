import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  body?: string;
  cta?: { href: string; label: string } | null;
  className?: string;
}

/**
 * Default decorative SVG illustration — small geometric mark in saffron + indigo.
 */
export function EmptyStateIllustration() {
  return (
    <svg
      role="presentation"
      aria-hidden="true"
      width="56"
      height="56"
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="28" cy="28" r="26" stroke="#D97706" strokeWidth="1.5" />
      <path
        d="M28 12 L34 26 L48 28 L34 30 L28 44 L22 30 L8 28 L22 26 Z"
        stroke="#1E3A5F"
        strokeWidth="1.5"
        fill="none"
      />
      <circle cx="28" cy="28" r="3" fill="#D97706" />
    </svg>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  cta,
  className,
}: EmptyStateProps) {
  return (
    <Card className={cn("flex flex-col items-center text-center gap-3 py-10", className)}>
      <div className="flex justify-center">{icon ?? <EmptyStateIllustration />}</div>
      <h3 className="font-display text-lg text-indigo">{title}</h3>
      {body ? (
        <p className="text-warm-gray max-w-md leading-relaxed">{body}</p>
      ) : null}
      {cta ? (
        <Link
          href={cta.href}
          className="inline-flex items-center gap-2 rounded-full bg-saffron text-white font-semibold px-6 py-3 text-sm min-h-[44px] hover:bg-amber-burnt transition-colors shadow-[0_4px_12px_rgba(217,119,6,0.25)] focus:outline-none focus-visible:ring-2 focus-visible:ring-saffron/40 focus-visible:ring-offset-2 mt-2"
        >
          {cta.label}
        </Link>
      ) : null}
    </Card>
  );
}
