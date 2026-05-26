/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production';

function sentryConnectOrigin() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;
  if (!dsn) return '';
  try {
    const u = new URL(dsn);
    // Sentry DSN form: https://<key>@o<n>.ingest.sentry.io/<project>
    // ingest endpoint is the host (without the public key segment).
    return `https://${u.hostname}`;
  } catch {
    return '';
  }
}

function buildCsp() {
  const sentryOrigin = sentryConnectOrigin();

  // Next.js dev needs 'unsafe-inline' / 'unsafe-eval' on script-src for HMR.
  // TODO(prod-hardening): switch script-src to a per-request nonce flow so we
  // can drop 'unsafe-inline' in production. Tracked under Phase 9 security.
  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    ...(isProd ? [] : ["'unsafe-eval'"]),
    'https://plausible.io',
    'https://js.stripe.com',
    'https://www.google.com',
  ].join(' ');

  const scriptSrcElem = [
    "'self'",
    "'unsafe-inline'",
    'https://plausible.io',
    'https://js.stripe.com',
  ].join(' ');

  const connectSrc = [
    "'self'",
    'https://api.stripe.com',
    'https://plausible.io',
    ...(sentryOrigin ? [sentryOrigin] : []),
  ].join(' ');

  const directives = [
    `default-src 'self'`,
    `script-src ${scriptSrc}`,
    `script-src-elem ${scriptSrcElem}`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' https://fonts.gstatic.com data:`,
    `img-src 'self' data: blob: https://images.unsplash.com https://res.cloudinary.com https://www.google.com https://maps.googleapis.com https://maps.gstatic.com`,
    `frame-src https://www.google.com https://js.stripe.com https://hooks.stripe.com`,
    `frame-ancestors 'none'`,
    `connect-src ${connectSrc}`,
    `base-uri 'self'`,
    `form-action 'self' https://checkout.stripe.com`,
    ...(isProd ? ['upgrade-insecure-requests'] : []),
  ];

  return directives.join('; ');
}

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
  },
  { key: 'Content-Security-Policy', value: buildCsp() },
  ...(isProd
    ? [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
      ]
    : []),
];

// NEXT_PUBLIC_SITE_URL is also read by src/app/layout.tsx to set
// metadata.metadataBase — Next.js looks for metadataBase on the Metadata
// export, not on NextConfig, so the value lives there too.

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
