"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/cn";

export interface LightboxProps {
  open: boolean;
  onClose: () => void;
  src: string;
  alt: string;
  caption?: string;
  onPrev?: () => void;
  onNext?: () => void;
}

export function Lightbox({
  open,
  onClose,
  src,
  alt,
  caption,
  onPrev,
  onNext,
}: LightboxProps) {
  const overlayRef = React.useRef<HTMLDivElement | null>(null);
  const closeRef = React.useRef<HTMLButtonElement | null>(null);
  const touchStartRef = React.useRef<{ x: number; y: number } | null>(null);

  React.useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowLeft" && onPrev) {
        e.preventDefault();
        onPrev();
      } else if (e.key === "ArrowRight" && onNext) {
        e.preventDefault();
        onNext();
      } else if (e.key === "Tab") {
        const root = overlayRef.current;
        if (!root) return;
        const focusables = root.querySelectorAll<HTMLElement>(
          'button, [href], [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose, onPrev, onNext]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={caption ?? alt}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onTouchStart={(e) => {
        const t = e.touches[0];
        touchStartRef.current = { x: t.clientX, y: t.clientY };
      }}
      onTouchEnd={(e) => {
        const start = touchStartRef.current;
        touchStartRef.current = null;
        if (!start) return;
        const t = e.changedTouches[0];
        const dx = t.clientX - start.x;
        const dy = t.clientY - start.y;
        // Horizontal swipe wins only if mostly horizontal and ≥50px.
        if (Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
          if (dx < 0 && onNext) onNext();
          else if (dx > 0 && onPrev) onPrev();
        }
      }}
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Close"
        className={cn(
          "absolute top-4 right-4 inline-flex items-center justify-center rounded-full bg-white/10 p-3 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-saffron",
        )}
      >
        <X size={24} />
      </button>

      {onPrev ? (
        <button
          type="button"
          onClick={onPrev}
          aria-label="Previous photo"
          className="absolute left-4 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full bg-white/10 p-3 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-saffron"
        >
          <ChevronLeft size={28} />
        </button>
      ) : null}

      {onNext ? (
        <button
          type="button"
          onClick={onNext}
          aria-label="Next photo"
          className="absolute right-4 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full bg-white/10 p-3 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-saffron"
        >
          <ChevronRight size={28} />
        </button>
      ) : null}

      <figure className="flex max-h-[90vh] max-w-[90vw] flex-col items-center gap-3">
        <div className="relative h-[80vh] w-[90vw] min-h-[200px] min-w-[200px]">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="90vw"
            priority
            style={{ objectFit: "contain" }}
          />
        </div>
        {caption ? (
          <figcaption className="text-center text-sm text-white/90">
            {caption}
          </figcaption>
        ) : null}
      </figure>
    </div>
  );
}
