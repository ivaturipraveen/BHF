"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { id, label, error, hint, className, required, disabled, rows = 4, ...rest },
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
        <label htmlFor={inputId} className="text-sm font-medium text-indigo">
          {label}
          {required ? <span className="text-saffron ml-0.5">*</span> : null}
        </label>
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={describedBy}
          required={required}
          disabled={disabled}
          className={cn(
            "min-h-[88px] w-full rounded-xl border-2 bg-white px-4 py-3 text-base text-indigo placeholder:text-warm-gray/60 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-saffron/20 focus:border-saffron disabled:opacity-60 disabled:cursor-not-allowed",
            error ? "border-red-500 bg-red-50/30" : "border-gray-200",
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
          <p id={errorId} role="alert" className="text-xs text-red-700">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
