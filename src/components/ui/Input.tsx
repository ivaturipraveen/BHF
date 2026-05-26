"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(
    { id, label, error, hint, className, required, disabled, ...rest },
    ref,
  ) {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;
    const describedBy =
      [error ? errorId : null, hint ? hintId : null]
        .filter(Boolean)
        .join(" ") || undefined;

    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-indigo"
        >
          {label}
          {required ? <span className="text-saffron ml-0.5">*</span> : null}
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={describedBy}
          required={required}
          disabled={disabled}
          className={cn(
            "h-12 w-full rounded-md border bg-white px-4 py-3 text-base text-indigo placeholder:text-warm-gray/60 focus:outline-none focus:ring-2 focus:ring-saffron focus:border-saffron disabled:opacity-50",
            error ? "border-red-500" : "border-gray-300",
            className,
          )}
          {...rest}
        />
        {hint && !error ? (
          <p id={hintId} className="text-xs text-warm-gray">
            {hint}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} role="alert" className="text-xs text-red-600">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
