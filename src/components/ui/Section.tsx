import * as React from "react";
import { cn } from "@/lib/cn";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  id?: string;
}

export function Section({ className, children, ...props }: SectionProps) {
  return (
    <section
      className={cn("py-20 md:py-28", className)}
      {...props}
    >
      {children}
    </section>
  );
}
