"use client";

import * as React from "react";
import { GalleryPhotoCard } from "@/components/cards/GalleryPhotoCard";
import { Lightbox } from "@/components/ui/Lightbox";
import type { GalleryPhoto } from "@/types/db";

export interface GalleryGridProps {
  photos: GalleryPhoto[];
  className?: string;
}

export function GalleryGrid({ photos, className }: GalleryGridProps) {
  const [index, setIndex] = React.useState<number | null>(null);

  if (photos.length === 0) {
    return (
      <p className="text-warm-gray">
        No photos in this category yet. Be the first to share one below.
      </p>
    );
  }

  const active = index === null ? null : photos[index];

  return (
    <>
      <div
        className={
          className ??
          "grid grid-cols-2 md:grid-cols-4 gap-3"
        }
      >
        {photos.map((photo, i) => (
          <GalleryPhotoCard
            key={photo.id}
            photo={photo}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>

      <Lightbox
        open={active !== null}
        onClose={() => setIndex(null)}
        src={active?.file_url ?? ""}
        alt={active?.caption ?? "Gallery photo"}
        caption={active?.caption ?? undefined}
        onPrev={
          index !== null && index > 0 ? () => setIndex(index - 1) : undefined
        }
        onNext={
          index !== null && index < photos.length - 1
            ? () => setIndex(index + 1)
            : undefined
        }
      />
    </>
  );
}
