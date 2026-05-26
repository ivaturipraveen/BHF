'use client';

import { useEffect } from 'react';

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
const UUID_RE = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi;
const SENSITIVE_QS = ['token', 'session_id'];

function scrubString(input: string): string {
  return input
    .replace(EMAIL_RE, '<redacted-email>')
    .replace(UUID_RE, '<redacted-uuid>');
}

function scrubUrl(input: string): string {
  try {
    const u = new URL(input, 'http://placeholder.invalid');
    let changed = false;
    for (const p of SENSITIVE_QS) {
      if (u.searchParams.has(p)) {
        u.searchParams.delete(p);
        changed = true;
      }
    }
    if (!changed) return input;
    if (u.origin === 'http://placeholder.invalid') {
      return u.pathname + (u.search ? u.search : '') + u.hash;
    }
    return u.toString();
  } catch {
    return input;
  }
}

export default function SentryInit() {
  useEffect(() => {
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
    if (!dsn || !dsn.startsWith('https://')) return;
    import('@sentry/nextjs')
      .then(({ init, browserTracingIntegration }) => {
        init({
          dsn,
          tracesSampleRate: 0.1,
          environment: process.env.NODE_ENV || 'development',
          sendDefaultPii: false,
          integrations: [browserTracingIntegration()],
          beforeSend(event) {
            try {
              if (event.message) {
                event.message = scrubString(event.message);
              }
              if (event.exception?.values) {
                for (const ex of event.exception.values) {
                  if (ex.value) ex.value = scrubString(ex.value);
                  if (ex.type) ex.type = scrubString(ex.type);
                }
              }
              if (event.request) {
                const req = event.request as Record<string, unknown>;
                if ('cookies' in req) delete req.cookies;
                if (typeof req.url === 'string') {
                  req.url = scrubUrl(req.url);
                }
                if (req.headers && typeof req.headers === 'object') {
                  const headers = req.headers as Record<string, string>;
                  if ('cookie' in headers) delete headers.cookie;
                  if ('Cookie' in headers) delete headers.Cookie;
                  if ('authorization' in headers) delete headers.authorization;
                  if ('Authorization' in headers) delete headers.Authorization;
                }
              }
              if (event.breadcrumbs) {
                for (const b of event.breadcrumbs) {
                  if (b.message) b.message = scrubString(b.message);
                  if (b.data && typeof b.data === 'object') {
                    const data = b.data as Record<string, unknown>;
                    if (typeof data.url === 'string') data.url = scrubUrl(data.url);
                    if (typeof data.to === 'string') data.to = scrubUrl(data.to);
                    if (typeof data.from === 'string') data.from = scrubUrl(data.from);
                  }
                }
              }
            } catch {
              // swallow; never let a scrubber error block reporting
            }
            return event;
          },
        });
      })
      .catch((err) => {
        console.warn('Sentry browser init failed:', err);
      });
  }, []);
  return null;
}
