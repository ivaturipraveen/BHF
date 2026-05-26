type DividerVariant = "default" | "footer";

interface SectionDividerProps {
  variant?: DividerVariant;
}

/**
 * Madhubani / temple-line-work inspired divider.
 * Pure flat 2-color (saffron + indigo); no fills with gradients.
 */
export function SectionDivider({ variant = "default" }: SectionDividerProps) {
  const wrapperClass =
    variant === "footer"
      ? "flex justify-center pb-8 bg-indigo"
      : "flex justify-center py-8 bg-white";
  const lineColor = variant === "footer" ? "text-cream" : "text-indigo";
  const accentColor = "text-saffron";

  return (
    <div role="presentation" aria-hidden="true" className={wrapperClass}>
      <svg
        width="640"
        height="24"
        viewBox="0 0 640 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="max-w-[80%]"
      >
        {/* outer lines extending outward */}
        <g className={lineColor} stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4">
          <line x1="10" y1="12" x2="240" y2="12" />
          <line x1="400" y1="12" x2="630" y2="12" />
          {/* outer small dots */}
          <circle cx="40" cy="12" r="1.2" fill="currentColor" fillOpacity="0.6" stroke="none" />
          <circle cx="80" cy="12" r="1.2" fill="currentColor" fillOpacity="0.6" stroke="none" />
          <circle cx="560" cy="12" r="1.2" fill="currentColor" fillOpacity="0.6" stroke="none" />
          <circle cx="600" cy="12" r="1.2" fill="currentColor" fillOpacity="0.6" stroke="none" />
        </g>

        {/* center diamond / lotus-bud motif in saffron */}
        <g className={accentColor} stroke="currentColor" strokeWidth="1.5" fill="none">
          {/* diamond */}
          <path d="M320 2 L336 12 L320 22 L304 12 Z" />
          {/* inner small diamond */}
          <path d="M320 7 L327 12 L320 17 L313 12 Z" />
        </g>

        {/* symmetric line segments fanning out from center */}
        <g className={lineColor} stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.55">
          <line x1="260" y1="12" x2="296" y2="12" />
          <line x1="344" y1="12" x2="380" y2="12" />
          {/* tick accents */}
          <line x1="262" y1="8" x2="262" y2="16" />
          <line x1="378" y1="8" x2="378" y2="16" />
        </g>

        {/* center dot accents */}
        <g className={accentColor}>
          <circle cx="280" cy="12" r="1.5" fill="currentColor" />
          <circle cx="360" cy="12" r="1.5" fill="currentColor" />
        </g>
      </svg>
    </div>
  );
}
