import 'server-only';
import { createHash } from 'crypto';

// Rate-limit contract:
// - rateLimit(ip, key, limit, windowMs): sliding window per (key, ip) pair returning
//   { ok, remaining, resetAt }. The "ip" string is opaque — typically the result of
//   getClientIp(headers), but any caller-chosen identifier is fine.
// - getClientIp(headers): resolves the rate-limit subject from request headers.
//     * If env TRUST_PROXY === '1', the first hop of x-forwarded-for is trusted.
//       Use this only when running behind a proxy that strips/rewrites the header.
//     * Otherwise x-forwarded-for is IGNORED entirely (it is trivially spoofable in
//       untrusted environments). x-real-ip is used if set, otherwise the subject is
//       'unknown'. In untrusted mode we ALSO append a short user-agent hash so that
//       a single host with many UAs (e.g. an unauthenticated attacker rotating UAs)
//       still gets multiple buckets and a single shared "unknown" bucket doesn't
//       collapse legitimate traffic together. This is not a substitute for a real
//       trusted client IP — but it keeps the limiter useful pre-proxy-config.
// - The in-memory buckets Map is capped at MAX_BUCKETS entries; when full we evict
//   the oldest insertion-order entries down to 80% of the cap, and also sweep any
//   buckets whose newest timestamp is older than the configured window.

const buckets = new Map<string, number[]>();

const MAX_BUCKETS = 10_000;
const EVICT_TARGET = Math.floor(MAX_BUCKETS * 0.8);

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
}

function evictIfFull(windowMs: number, now: number): void {
  if (buckets.size <= MAX_BUCKETS) return;
  const cutoff = now - windowMs;
  // First pass: drop stale buckets (newest entry older than the window).
  for (const [k, v] of buckets) {
    const newest = v.length > 0 ? v[v.length - 1] : 0;
    if (newest <= cutoff) buckets.delete(k);
  }
  if (buckets.size <= EVICT_TARGET) return;
  // Second pass: evict in insertion order (Map preserves it) until at target.
  const toRemove = buckets.size - EVICT_TARGET;
  let removed = 0;
  for (const k of buckets.keys()) {
    if (removed >= toRemove) break;
    buckets.delete(k);
    removed++;
  }
}

export function rateLimit(
  ip: string,
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const cutoff = now - windowMs;
  const bucketKey = `${key}:${ip}`;
  const existing = buckets.get(bucketKey) ?? [];
  // Drop entries older than the window.
  const recent = existing.filter((ts) => ts > cutoff);

  if (recent.length >= limit) {
    const oldest = recent[0];
    return {
      ok: false,
      remaining: 0,
      resetAt: oldest + windowMs,
    };
  }

  recent.push(now);
  // Re-insert to keep Map insertion order = "most recently touched".
  buckets.delete(bucketKey);
  buckets.set(bucketKey, recent);

  evictIfFull(windowMs, now);

  return {
    ok: true,
    remaining: limit - recent.length,
    resetAt: now + windowMs,
  };
}

function hashUserAgent(ua: string): string {
  return createHash('sha1').update(ua).digest('hex').slice(0, 16);
}

export function getClientIp(headers: Headers): string {
  const trustProxy = process.env.TRUST_PROXY === '1';

  if (trustProxy) {
    const fwd = headers.get('x-forwarded-for');
    if (fwd) {
      const first = fwd.split(',')[0]?.trim();
      if (first) return first;
    }
    const real = headers.get('x-real-ip');
    if (real) return real.trim();
    return 'unknown';
  }

  // Untrusted mode: ignore x-forwarded-for. Prefer x-real-ip if a deployment sets it,
  // otherwise fall back to a UA-hash composite to keep buckets meaningfully partitioned.
  const real = headers.get('x-real-ip');
  const ua = headers.get('user-agent') ?? '';
  const uaHash = ua ? hashUserAgent(ua) : 'no-ua';
  if (real) {
    const trimmed = real.trim();
    if (trimmed) return `${trimmed}|${uaHash}`;
  }
  return `unknown|${uaHash}`;
}

/**
 * Returns the raw client IP only (no UA-hash composite).
 * Use for storing IP in audit/compliance columns (e.g., parental_consent_ip).
 * NOT for rate-limit bucket keys — use getClientIp for that.
 */
export function getRawClientIp(headers: Headers): string {
  if (process.env.TRUST_PROXY === '1') {
    const xff = headers.get('x-forwarded-for');
    if (xff) {
      const first = xff.split(',')[0]?.trim();
      if (first) return first;
    }
  }
  const xri = headers.get('x-real-ip');
  if (xri) return xri.trim();
  return 'unknown';
}
