export const EIN: string = process.env.BHF_EIN ?? 'XX-XXXXXXX';
export const LEGAL_NAME: string =
  process.env.BHF_LEGAL_NAME ?? 'Bharatiya Heritage Foundation';
export const DONATION_CONTACT_PHONE: string =
  process.env.BHF_DONATION_PHONE ?? '(415) 770-5694';
export const LEGAL_ADDRESS: string =
  process.env.BHF_LEGAL_ADDRESS ?? 'Fairfield, CA';

export const DONATION_TIERS = {
  MONTHLY: [15, 25, 50, 75, 100, 250, 450, 750] as const,
  YEARLY: [300, 600, 900, 2000, 3500, 6000, 10000] as const,
  ONE_TIME: [300, 600, 900, 1500, 2000, 3500, 6000, 10000] as const,
} as const;

export const LARGE_GIFT_THRESHOLD = 1000;
