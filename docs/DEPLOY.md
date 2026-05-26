# Deployment Guide

This document covers the production deployment of the BHF website. Most of the operational details live in the maintainer's handbook; this guide focuses on what needs to be set on the production host **before** the first deploy.

## Production environment variables

All variables below are read at server startup. Anything prefixed `NEXT_PUBLIC_` is also exposed to the browser bundle, so never put a secret in one. After changing any variable, restart the Next.js process (`npm run start`) so the new values take effect.

Use the table beneath each section as your checklist when you bring up a new environment.

### Database

| Variable | Description | Where to get it | Example |
|---|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string. The schema (`bw_bhf_38`) is pinned via `search_path` on the URL. Already provisioned by the BrightWorks platform — do not change unless you are migrating providers. | BrightWorks environment (pre-set). | `postgres://bhf:***@db.internal:5432/bhf?search_path=bw_bhf_38` |

### Auth

| Variable | Description | Where to get it | Example |
|---|---|---|---|
| `JWT_SECRET` | HMAC key used to sign admin and member session tokens. **Rotate to ≥ 48 random bytes before launch.** A leak invalidates every active session and requires re-issuing the secret. | Generate with `openssl rand -base64 48`. Store in your secrets manager. | `3hP7…(64 chars)…Q==` |

### Site

| Variable | Description | Where to get it | Example |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical public origin. Used for `<link rel="canonical">`, sitemap absolute URLs, OpenGraph URLs, and email links. No trailing slash. | The domain you registered for the site. | `https://bhfcommunity.org` |

### Stripe

| Variable | Description | Where to get it | Example |
|---|---|---|---|
| `STRIPE_SECRET_KEY` | Server-side Stripe API key. Use the **live** key in production and the **test** key everywhere else. Required for `/donate` and recurring giving. | Stripe Dashboard → Developers → API keys → Secret key. | `sk_live_…` |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for the `/api/stripe/webhook` endpoint. Used to verify event authenticity. One per endpoint per environment. | Stripe Dashboard → Developers → Webhooks → (your endpoint) → Signing secret. | `whsec_…` |

### Email (transactional)

| Variable | Description | Where to get it | Example |
|---|---|---|---|
| `RESEND_API_KEY` | API key for transactional email (donation receipts, password resets, RSVP confirmations). | Resend dashboard → API Keys → Create API Key. | `re_…` |
| `RESEND_FROM` | Default `From:` address. Must be a verified domain in Resend, or sending will fail with HTTP 403. | The verified sender on your Resend account. | `BHF <noreply@bhfcommunity.org>` |

### Newsletter

| Variable | Description | Where to get it | Example |
|---|---|---|---|
| `MAILCHIMP_API_KEY` | Mailchimp Marketing API key. Used to push newsletter signups from the footer form. | Mailchimp → Account → Extras → API keys. | `abc123…-us21` |
| `MAILCHIMP_AUDIENCE_ID` | The audience (list) ID new subscribers are added to. | Mailchimp → Audience → All contacts → Settings → Audience name and defaults. | `e3f1a2b4c5` |

### Analytics

| Variable | Description | Where to get it | Example |
|---|---|---|---|
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Plausible site domain. When set, the public site loads the Plausible tracker; `/admin` routes never load it regardless of value. Leave empty in non-prod environments. | The domain you configured on plausible.io. | `bhfcommunity.org` |

### Error monitoring

| Variable | Description | Where to get it | Example |
|---|---|---|---|
| `SENTRY_DSN` | Server-side Sentry DSN. Used by API routes and server components to report unhandled errors. | Sentry → Project → Settings → Client Keys (DSN). | `https://abc…@o123.ingest.sentry.io/456` |
| `NEXT_PUBLIC_SENTRY_DSN` | Browser-side Sentry DSN. Wired up via dynamic import in `<SentryInit />` so the SDK is only fetched when this is set. Usually the same DSN as the server one. | Same as above. | `https://abc…@o123.ingest.sentry.io/456` |

### Organization

| Variable | Description | Where to get it | Example |
|---|---|---|---|
| `BHF_EIN` | Federal Employer Identification Number. Printed on donation receipts and the footer where tax-deductibility is claimed. | IRS determination letter (Form 1023 approval). | `12-3456789` |
| `BHF_LEGAL_NAME` | Registered name of the 501(c)(3). Used on receipts and legal pages. | Articles of incorporation. | `Bharatiya Heritage Foundation, Inc.` |
| `BHF_DONATION_PHONE` | Phone number printed on donation receipts for donor questions. | Operations team. | `+1-707-555-0142` |

### Bootstrap (delete after first login)

| Variable | Description | Where to get it | Example |
|---|---|---|---|
| `INITIAL_ADMIN_PASSWORD` | Used by `scripts/seed.ts` to create the first super-admin account so you can sign in to `/admin/login`. **Unset this variable from the environment as soon as you have logged in once and rotated the password.** | Generate with `openssl rand -base64 24`. | `tH9b…(32 chars)` |
| `DEMO_MEMBER_PASSWORD` | Used by the seed script to create a demo member account for QA. **Unset after first login**, just like `INITIAL_ADMIN_PASSWORD`. Never set this in production unless you have a specific reason. | Generate with `openssl rand -base64 24`. | `kQ2x…(32 chars)` |

### Operational

| Variable | Description | Where to get it | Example |
|---|---|---|---|
| `TRUST_PROXY` | Set to `1` when running behind a load balancer or reverse proxy (e.g. Caddy, nginx, AWS ALB). Tells the app to trust `X-Forwarded-For` / `X-Forwarded-Proto` headers, which are needed for accurate client IPs in rate-limit and audit-log entries. Leave unset (or `0`) when the Node process is directly internet-facing. | Set based on your hosting topology. | `1` |

## Pre-launch checklist

Before flipping DNS to production, walk this list once:

- [ ] `JWT_SECRET` rotated to ≥ 48 random bytes.
- [ ] `INITIAL_ADMIN_PASSWORD` and `DEMO_MEMBER_PASSWORD` removed from the environment after first login.
- [ ] `STRIPE_SECRET_KEY` is a **live** key, not a test key.
- [ ] `STRIPE_WEBHOOK_SECRET` matches the live webhook endpoint configured in the Stripe dashboard.
- [ ] `RESEND_FROM` is a verified domain in Resend.
- [ ] `NEXT_PUBLIC_SITE_URL` matches the canonical hostname users will visit, with no trailing slash.
- [ ] `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` set (or intentionally left unset).
- [ ] `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN` both set (or both unset — mixing them is usually a mistake).
- [ ] `TRUST_PROXY=1` if and only if the app is behind a load balancer.
