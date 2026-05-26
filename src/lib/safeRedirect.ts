/**
 * Returns a sanitized same-origin redirect path, or a default fallback.
 * Accepts only relative paths (starting with '/') that have an empty host
 * when parsed against an arbitrary placeholder origin.
 */
export function safeRedirect(next: unknown, fallback = "/account"): string {
  if (typeof next !== "string" || next.length === 0) return fallback;
  if (next.length > 2048) return fallback;
  // Reject anything with backslash, leading double-slash, or scheme.
  if (next.includes("\\")) return fallback;
  if (next.startsWith("//")) return fallback;
  if (!next.startsWith("/")) return fallback;
  try {
    const placeholder = "https://bhf-validate.invalid";
    const parsed = new URL(next, placeholder);
    // Must remain on the placeholder host. Any change = absolute or scheme-aware redirect.
    if (parsed.origin !== placeholder) return fallback;
    // Reject if host is non-empty after parsing (defense-in-depth, redundant w/ origin check).
    if (parsed.host !== "bhf-validate.invalid") return fallback;
    // Reconstruct just pathname + search + hash so we strip anything weird.
    return parsed.pathname + parsed.search + parsed.hash;
  } catch {
    return fallback;
  }
}
