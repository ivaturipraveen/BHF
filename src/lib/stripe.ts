import 'server-only';
import Stripe from 'stripe';

const KEY = process.env.STRIPE_SECRET_KEY;

export const STRIPE_ENABLED: boolean =
  !!KEY && KEY !== 'stub' && KEY.startsWith('sk_');

// Pin to '2024-06-20' per project spec. The installed Stripe SDK ships
// stricter default typings; cast through unknown to honor the pinned version.
type StripeCtorOpts = ConstructorParameters<typeof Stripe>[1];
const stripeConfig = {
  apiVersion: '2024-06-20',
  typescript: true,
} as unknown as StripeCtorOpts;

export const stripe: Stripe | null = STRIPE_ENABLED
  ? new Stripe(KEY!, stripeConfig)
  : null;

export function requireStripe(): Stripe {
  if (!stripe) throw new Error('Stripe is not configured.');
  return stripe;
}
