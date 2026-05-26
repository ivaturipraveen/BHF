import * as React from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/cn";

export interface FeedbackBannerProps {
  variant: "success" | "error";
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function FeedbackBanner({
  variant,
  title,
  children,
  className,
}: FeedbackBannerProps) {
  const isSuccess = variant === "success";
  const Icon = isSuccess ? CheckCircle2 : AlertCircle;
  return (
    <div
      role={isSuccess ? "status" : "alert"}
      className={cn(
        "flex items-start gap-3 p-4 rounded border-l-4",
        isSuccess
          ? "bg-saffron/10 border-saffron text-indigo"
          : "bg-red-50 border-red-500 text-red-700",
        className,
      )}
    >
      <Icon
        size={20}
        className={isSuccess ? "text-saffron mt-0.5 flex-shrink-0" : "text-red-500 mt-0.5 flex-shrink-0"}
        aria-hidden="true"
      />
      <div className="flex-1">
        {title ? <p className="font-semibold mb-1">{title}</p> : null}
        <div className="text-sm leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
