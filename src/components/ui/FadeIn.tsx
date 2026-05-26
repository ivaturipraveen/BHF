"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

export interface FadeInProps {
  children: React.ReactNode;
  delayMs?: number;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
}

const ALLOWED_DELAYS = new Set([0, 75, 150, 225, 300, 375, 450, 525, 600]);

function normalizeDelay(delayMs: number | undefined): number {
  if (!delayMs || delayMs <= 0) return 0;
  if (ALLOWED_DELAYS.has(delayMs)) return delayMs;
  const snapped = Math.round(delayMs / 75) * 75;
  return Math.min(600, Math.max(0, snapped));
}

export function FadeIn({
  children,
  delayMs,
  className,
  as = "div",
}: FadeInProps) {
  const ref = React.useRef<HTMLElement | null>(null);
  const delay = normalizeDelay(delayMs);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window === "undefined") return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) {
      el.classList.add("is-visible");
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-visible");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const Tag = as as React.ElementType;
  return (
    <Tag
      ref={ref}
      className={cn("reveal", className)}
      style={delay > 0 ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
