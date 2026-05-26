"use client";

import * as React from "react";

export interface CountUpProps {
  end: number;
  durationMs?: number;
  className?: string;
}

function formatNumber(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

export function CountUp({ end, durationMs = 1500, className }: CountUpProps) {
  const [value, setValue] = React.useState(0);
  const [started, setStarted] = React.useState(false);
  const ref = React.useRef<HTMLSpanElement | null>(null);
  const rafRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window === "undefined") return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) {
      setValue(end);
      setStarted(true);
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      setValue(end);
      setStarted(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !started) {
            setStarted(true);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, started]);

  React.useEffect(() => {
    if (!started) return;
    const startTime = performance.now();
    const startValue = 0;
    const range = end - startValue;

    function tick(now: number) {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(startValue + range * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setValue(end);
      }
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [started, end, durationMs]);

  return (
    <span ref={ref} className={className}>
      {formatNumber(value)}
    </span>
  );
}
