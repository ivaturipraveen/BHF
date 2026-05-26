import * as React from "react";
import { cn } from "@/lib/cn";

type CardVariant = "default" | "elevated" | "flat";

const variants: Record<CardVariant, string> = {
  default: "shadow-sm",
  elevated: "shadow-md",
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
        "bg-white border border-gray-200 rounded-xl p-6",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
