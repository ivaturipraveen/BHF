"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export interface LibraryItem {
  id: string;
  title: string;
  description: string | null;
  category: string;
  content_type: "video" | "pdf" | "audio";
  content_url: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
}

function youtubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.slice(1) || null;
    }
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return v;
      const parts = u.pathname.split("/");
      const embedIdx = parts.indexOf("embed");
      if (embedIdx >= 0 && parts[embedIdx + 1]) return parts[embedIdx + 1];
    }
    return null;
  } catch {
    return null;
  }
}

function vimeoId(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("vimeo.com")) return null;
    const last = u.pathname.split("/").filter(Boolean).pop();
    if (last && /^\d+$/.test(last)) return last;
    return null;
  } catch {
    return null;
  }
}

function thumbnailFor(item: LibraryItem): string | null {
  if (item.thumbnail_url) return item.thumbnail_url;
  if (item.content_type !== "video") return null;
  const yt = youtubeId(item.content_url);
  if (yt) return `https://img.youtube.com/vi/${yt}/hqdefault.jpg`;
  return null;
}

function formatDuration(secs: number | null): string | null {
  if (!secs || secs <= 0) return null;
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s.toString().padStart(2, "0")}s`;
  return `${s}s`;
}

export function LibraryGrid({ items }: { items: LibraryItem[] }) {
  const [active, setActive] = React.useState<LibraryItem | null>(null);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setActive(null);
    }
    if (active) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", onKey);
        document.body.style.overflow = "";
      };
    }
  }, [active]);

  function onClick(item: LibraryItem) {
    if (item.content_type === "video") {
      setActive(item);
    } else {
      window.open(item.content_url, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
          const thumb = thumbnailFor(item);
          const duration = formatDuration(item.duration_seconds);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onClick(item)}
              className="text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-saffron rounded-xl"
            >
              <Card className="overflow-hidden p-0">
                <div className="relative aspect-video bg-cream">
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumb}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover group-hover:opacity-90"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-warm-gray text-sm">
                      No preview
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge variant="saffron">{item.content_type}</Badge>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg text-indigo group-hover:text-saffron transition-colors">
                    {item.title}
                  </h3>
                  {duration ? (
                    <p className="mt-1 text-xs text-warm-gray">{duration}</p>
                  ) : null}
                  {item.description ? (
                    <p className="mt-2 text-sm text-warm-gray line-clamp-2">
                      {item.description}
                    </p>
                  ) : null}
                </div>
              </Card>
            </button>
          );
        })}
      </div>

      {active ? (
        <VideoModal item={active} onClose={() => setActive(null)} />
      ) : null}
    </>
  );
}

function VideoModal({
  item,
  onClose,
}: {
  item: LibraryItem;
  onClose: () => void;
}) {
  const yt = youtubeId(item.content_url);
  const vimeo = vimeoId(item.content_url);
  const src = yt
    ? `https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0`
    : vimeo
      ? `https://player.vimeo.com/video/${vimeo}?autoplay=1`
      : item.content_url;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-indigo/90 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute -top-12 right-0 text-white hover:text-saffron flex items-center gap-2"
        >
          <X size={24} />
          <span className="text-sm">Close</span>
        </button>
        <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
          <iframe
            title={item.title}
            src={src}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <p className="mt-3 font-display text-xl text-white">{item.title}</p>
        {item.description ? (
          <p className="mt-1 text-sm text-white/80">{item.description}</p>
        ) : null}
      </div>
    </div>
  );
}
