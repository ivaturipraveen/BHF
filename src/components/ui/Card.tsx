import * as React from "react";
import { cn } from "@/lib/cn";

type CardVariant = "default" | "elevated" | "flat";

const variants: Record<CardVariant, string> = {
  default: "",
  elevated: "",
  flat: "",
};

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

export function Card({
  className,
  variant = "default",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "bg-white border border-gray-200 rounded-2xl p-6 transition-colors duration-200 hover:border-saffron hover:bg-cream/30",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
