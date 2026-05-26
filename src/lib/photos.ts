// Stock placeholders only. Per PRD §3.1, real BHF event photography is the
// long-term direction — admin uploads via /admin/gallery-photos replace these.

/**
 * Curated Unsplash photography for BHF.
 *
 * Selection principles:
 *  - Warm, communal, heritage-respectful imagery.
 *  - Avoid stock clichés (no white-hands-over-handshake, no generic boardroom).
 *  - Photographer-driven framing; tones that sit comfortably next to the
 *    saffron/indigo/cream palette.
 *
 * URL shape: deep Unsplash photo URL + `auto=format&fit=crop&w=...&q=80` so
 * `next/image` can serve responsive variants without re-uploading.
 */

const u = (id: string, w = 2000) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const PHOTOS = {
  // Hero — empty string triggers the brand fallback (no full-bleed photo).
  HERO: "",

  // Diwali — diyas, oil lamps, festival of lights
  DIWALI: [
    u("photo-1572804013427-4d7ca7268217", 1600),
  ],

  // Holi — colors, joy, spring
  HOLI: [] as string[],

  // Yoga / wellness — calm, deliberate, daylight
  YOGA: [
    u("photo-1545205597-3d9d02c29597", 1600),
    u("photo-1599901860904-17e6ed7083a0", 1600),
  ],

  // Kids / classroom / learning
  KIDS: [
    u("photo-1529390079861-591de354faf5", 1600),
    u("photo-1503676260728-1c00da094a0b", 1600),
  ],

  // Community / gathering / family
  COMMUNITY: [
    u("photo-1531058020387-3be344556be6", 1600),
    u("photo-1511632765486-a01980e01a18", 1600),
    u("photo-1543269865-cbf427effbad", 1600),
  ],

  // Food / shared meal
  FOOD: [
    u("photo-1565557623262-b51c2513a641", 1600),
    u("photo-1543353071-873f17a7a088", 1600),
  ],

  // Mountains / nature / heritage walk
  MOUNTAINS: [
    u("photo-1551632811-561732d1e306", 1600),
    u("photo-1464822759023-fed622ff2c3b", 1600),
  ],

  // Celebration / lights / general festival
  CELEBRATION: [
    u("photo-1551731409-43eb3e517a1a", 1600),
    u("photo-1513364776144-60967b0f800f", 1600),
  ],
} as const;

export type PhotoTheme = keyof typeof PHOTOS;

/**
 * Pick the first photo of a theme. Themes that are single-URL return that URL.
 * Returns empty string when the theme has no photos.
 */
export function firstPhoto(theme: PhotoTheme): string {
  const value: string | readonly string[] = PHOTOS[theme];
  if (Array.isArray(value)) {
    return value.length > 0 ? value[0] : "";
  }
  return value as string;
}
