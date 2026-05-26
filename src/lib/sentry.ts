import 'server-only';

const DSN = process.env.SENTRY_DSN;
export const SENTRY_ENABLED = !!DSN && DSN.startsWith('https://');

type SentryEvent = {
  message?: string;
  exception?: {
    values?: Array<{ value?: string }>;
  };
  request?: {
    cookies?: unknown;
    headers?: Record<string, unknown>;
    query_string?: string | Array<[string, string]>;
    url?: string;
  };
};

type SentryModule = {
  init: (opts: Record<string, unknown>) => void;
  captureException: (err: unknown, opts?: Record<string, unknown>) => void;
};

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
const UUID_RE =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
const SENSITIVE_QS_KEY_RE = /(token|session_id|api_key|access_token|refresh_token|secret)/i;

export function redactString(s: string): string {
  return s.replace(EMAIL_RE, '<redacted-email>').replace(UUID_RE, '<redacted-uuid>');
}

function redactQueryString(qs: string): string {
  const out: string[] = [];
  for (const part of qs.split('&')) {
    const eq = part.indexOf('=');
    const key = eq >= 0 ? part.slice(0, eq) : part;
    if (SENSITIVE_QS_KEY_RE.test(key)) {
      out.push(`${key}=<redacted>`);
    } else {
      out.push(part);
    }
  }
  return out.join('&');
}

function redactUrl(url: string): string {
  const qIdx = url.indexOf('?');
  if (qIdx < 0) return url;
  return url.slice(0, qIdx + 1) + redactQueryString(url.slice(qIdx + 1));
}

export function scrubEvent(event: SentryEvent): SentryEvent {
  if (event.message) {
    event.message = redactString(event.message);
  }
  if (event.exception?.values) {
    for (const v of event.exception.values) {
      if (v.value) v.value = redactString(v.value);
    }
  }
  if (event.request) {
    delete event.request.cookies;
    if (event.request.headers) {
      const h = event.request.headers;
      for (const k of Object.keys(h)) {
        const lower = k.toLowerCase();
        if (lower === 'cookie' || lower === 'authorization' || lower === 'set-cookie') {
          delete h[k];
        }
      }
    }
    if (typeof event.request.query_string === 'string') {
      event.request.query_string = redactQueryString(event.request.query_string);
    } else if (Array.isArray(event.request.query_string)) {
      event.request.query_string = event.request.query_string.map(([k, v]) =>
        SENSITIVE_QS_KEY_RE.test(k) ? [k, '<redacted>'] : [k, v],
      );
    }
    if (typeof event.request.url === 'string') {
      event.request.url = redactUrl(event.request.url);
    }
  }
  return event;
}

let sentryModule: SentryModule | null = null;
if (SENTRY_ENABLED) {
  try {
    const Sentry = require('@sentry/nextjs') as SentryModule;
    Sentry.init({
      dsn: DSN,
      tracesSampleRate: 0.1,
      environment: process.env.NODE_ENV || 'development',
      sendDefaultPii: false,
      beforeSend(event: SentryEvent) {
        return scrubEvent(event);
      },
    });
    sentryModule = Sentry;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[sentry] failed to initialise', err);
    sentryModule = null;
  }
}

export function reportError(
  err: unknown,
  context?: Record<string, unknown>,
): void {
  if (SENTRY_ENABLED && sentryModule) {
    try {
      sentryModule.captureException(err, { extra: context });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[sentry] captureException failed', e);
    }
  }
  // Always preserve a console trail for local/CI logs.
  // eslint-disable-next-line no-console
  console.error(
    context?.route ? `[${String(context.route)}]` : '[error]',
    err,
    context && Object.keys(context).length > 1 ? context : '',
  );
}
