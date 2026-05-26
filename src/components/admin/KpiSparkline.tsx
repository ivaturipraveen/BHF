export interface KpiSparklineProps {
  /** Series values (oldest first). */
  values: number[];
  className?: string;
  ariaLabel?: string;
}

/**
 * Tiny inline sparkline for KPI cards. Pure SVG, no chart lib.
 * Currently fed with mocked/sample data — the structure here matches what a
 * future real-time-series feed will provide.
 */
export function KpiSparkline({
  values,
  className,
  ariaLabel = "Trend",
}: KpiSparklineProps) {
  if (!values.length) return null;
  const w = 100;
  const h = 24;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const stepX = w / Math.max(1, values.length - 1);

  const points = values
    .map((v, i) => {
      const x = i * stepX;
      const y = h - ((v - min) / range) * h;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={className ?? "h-6 w-full text-saffron"}
      role="img"
      aria-label={ariaLabel}
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
