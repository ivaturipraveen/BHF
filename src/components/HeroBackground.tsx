"use client";

import { useEffect, useState } from "react";

export default function HeroBackground() {
  const [failed, setFailed] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  if (failed) return null;

  if (reducedMotion) {
    return (
      <img
        src="/brand/hero-poster.jpg"
        alt=""
        aria-hidden="true"
        width={1920}
        height={1080}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "brightness(0.55) saturate(1.1)" }}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster="/brand/hero-poster.jpg"
      aria-hidden="true"
      tabIndex={-1}
      width={1920}
      height={1080}
      onError={() => setFailed(true)}
      className="absolute inset-0 w-full h-full object-cover"
      style={{ filter: "brightness(0.78) saturate(1.05)" }}
    >
      {/* Only MP4 — adding a non-existent .webm source can cause some
          browsers to trigger video error early. Add a webm <source>
          back ABOVE this mp4 line if a hero.webm is ever shipped. */}
      <source src="/brand/hero.mp4" type="video/mp4" />
    </video>
  );
}
