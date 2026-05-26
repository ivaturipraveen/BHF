"use client";

import Image from "next/image";
import { cn } from "@/lib/cn";
import type { GalleryPhoto } from "@/types/db";

export interface GalleryPhotoCardProps {
  photo: GalleryPhoto;
  onClick: () => void;
  className?: string;
}

export function GalleryPhotoCard({
  photo,
  onClick,
  className,
}: GalleryPhotoCardProps) {
  const src = photo.thumb_url ?? photo.file_url;
  const alt = photo.caption ?? "Gallery photo";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={photo.caption ?? "Open photo"}
      className={cn(
        "group relative aspect-square w-full overflow-hidden rounded-lg bg-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-saffron focus-visible:ring-offset-2",
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />
    </button>
  );
}
