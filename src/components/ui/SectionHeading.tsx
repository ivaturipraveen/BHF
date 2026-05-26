import { cn } from "@/lib/cn";

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <div className={cn("flex flex-col gap-3", alignClass, className)}>
      {eyebrow ? (
        <p className="text-saffron font-semibold uppercase tracking-widest text-xs">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-display text-3xl md:text-4xl text-indigo">{title}</h2>
      {description ? (
        <p
          className={cn(
            "text-warm-gray text-lg leading-relaxed max-w-2xl",
            align === "center" ? "mx-auto" : null,
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
