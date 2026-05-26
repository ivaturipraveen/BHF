"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  hint?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ id, label, hint, className, ...rest }, ref) {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    return (
      <div className="flex items-start gap-3">
        <input
          ref={ref}
          type="checkbox"
          id={inputId}
          className={cn(
            "h-5 w-5 accent-saffron rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-saffron focus:ring-offset-1 mt-0.5",
            className,
          )}
          {...rest}
        />
        <label htmlFor={inputId} className="text-sm text-indigo leading-snug">
          {label}
          {hint ? (
            <span className="block text-xs text-warm-gray mt-0.5">{hint}</span>
          ) : null}
        </label>
      </div>
    );
  },
);
