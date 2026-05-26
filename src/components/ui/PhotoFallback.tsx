import { cn } from "@/lib/cn";

export interface PhotoFallbackProps {
  className?: string;
  /** Accent color class — default uses saffron at low opacity. */
  accentClassName?: string;
}

/**
 * Brand-toned placeholder for cards/heroes without imagery.
 * A simplified Madhubani-style mandala on cream — never empty gray.
 */
export function PhotoFallback({
  className,
  accentClassName = "text-saffron/40",
}: PhotoFallbackProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center bg-cream",
        className,
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 120 120"
        className={cn("w-24 h-24", accentClassName)}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="60" cy="60" r="44" />
        <circle cx="60" cy="60" r="30" />
        <circle cx="60" cy="60" r="16" />
        <circle cx="60" cy="60" r="4" fill="currentColor" />
        <path d="M60 16 L66 50 L60 60 L54 50 Z" />
        <path d="M60 104 L66 70 L60 60 L54 70 Z" />
        <path d="M16 60 L50 54 L60 60 L50 66 Z" />
        <path d="M104 60 L70 54 L60 60 L70 66 Z" />
        <path d="M28 28 L52 52" />
        <path d="M92 28 L68 52" />
        <path d="M28 92 L52 68" />
        <path d="M92 92 L68 68" />
      </svg>
    </div>
  );
}
