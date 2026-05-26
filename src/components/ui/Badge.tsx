import * as React from "react";
import { cn } from "@/lib/cn";

type BadgeVariant = "saffron" | "indigo" | "amber" | "gray";

const variants: Record<BadgeVariant, string> = {
  saffron: "bg-saffron/10 text-saffron",
  indigo: "bg-indigo/10 text-indigo",
  amber: "bg-amber-burnt/10 text-amber-burnt",
  gray: "bg-gray-100 text-warm-gray",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({
  variant = "gray",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
