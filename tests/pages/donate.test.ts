// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { query } from '../../src/lib/db';
import {
  BASE,
  DEMO_EMAIL,
  DEMO_PASSWORD,
  computeAccessToken,
  donorEmail,
  ensureServerReachable,
  loginAndGetCookie,
  testHeaders,
} from '../donations/_helpers';

const createdDonationIds: string[] = [];

interface CheckoutResponse {
  donationId?: string;
  successUrl?: string;
  mode?: string;
}

async function makeStubDonation(opts: {
  cookie?: string;
  donorName?: string;
  amountCents?: number;
}): Promise<{ id: string; donorName: string; amountCents: number }> {
  const headers: Record<string, string> = {};
  if (opts.cookie) headers.Cookie = opts.cookie;
  const donorName = opts.donorName ?? 'Page Test Donor';
  const amountCents = opts.amountCents ?? 4200;
  const res = await fetch(`${BASE}/api/donations/checkout`, {
    method: 'POST',
    headers: testHeaders(headers),
    body: JSON.stringify({
      amountCents,
      type: 'one_time',
      donorName,
      donorEmail: donorEmail(),
    }),
  });
  const json = (await res.json()) as CheckoutResponse;
  if (!json.donationId) {
    throw new Error(`checkout failed: ${JSON.stringify(json)}`);
  }
  createdDonationIds.push(json.donationId);
  return { id: json.donationId, donorName, amountCents };
}

beforeAll(async () => {
  await ensureServerReachable();
});

afterAll(async () => {
  if (createdDonationIds.length > 0) {
    await query(`DELETE FROM donations WHERE id = ANY($1::uuid[])`, [
      createdDonationIds,
    ]);
  }
});

async function getHtml(
  path: string,
  cookie?: string,
): Promise<{ status: number; body: string }> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'GET',
    headers: testHeaders(cookie ? { Cookie: cookie } : {}),
  });
  const body = await res.text();
  return { status: res.status, body };
}

describe('GET /donate (stub mode)', () => {
  it('renders the donation page with stub banner, phone, and 501(c)(3) language', async () => {
    const { status, body } = await getHtml('/donate');
    expect(status).toBe(200);
    expect(body).toContain('Your seva sustains');
    expect(body).toContain('Demo mode');
    expect(body).toContain('(415) 770-5694');
    expect(body).toContain('501(c)(3)');
  });
});

describe('GET /donate/thank-you', () => {
  it('renders a generic thank-you page when no params are provided', async () => {
    const { status, body } = await getHtml('/donate/thank-you');
    expect(status).toBe(200);
    expect(body.toLowerCase()).toContain('thank you');
  });

  it('renders the donor-specific thank-you page with a valid id+token', async () => {
    const { id, donorName, amountCents } = await makeStubDonation({
      donorName: `Donor ${Math.floor(Math.random() * 1_000_000)}`,
      amountCents: 12345,
    });
    const token = computeAccessToken(id);
    const { status, body } = await getHtml(
      `/donate/thank-you?id=${id}&token=${token}&demo=1`,
    );
    expect(status).toBe(200);
    expect(body).toContain(donorName);
    // Amount renders as "$123.45" via Intl formatter.
    const dollars = (amountCents / 100).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    expect(body).toContain(`$${dollars}`);
  });

  it('renders the generic fallback (not a crash) when the token is wrong', async () => {
    const { id } = await makeStubDonation({});
    const wrong = 'b'.repeat(64);
    const { status, body } = await getHtml(
      `/donate/thank-you?id=${id}&token=${wrong}`,
    );
    expect(status).toBe(200);
    expect(body.toLowerCase()).toContain('thank you');
  });
});

describe('GET /account/donations', () => {
  it('lists a newly-created stub donation for the logged-in member', async () => {
    const { pair } = await loginAndGetCookie(DEMO_EMAIL, DEMO_PASSWORD);
    const { amountCents } = await makeStubDonation({
      cookie: pair,
      donorName: 'Demo Account Donor',
      amountCents: 8765,
    });

    const { status, body } = await getHtml('/account/donations', pair);
    expect(status).toBe(200);
    // The page formats amounts via Intl with 2 decimals.
    const dollars = (amountCents / 100).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    expect(body).toContain(`$${dollars}`);
  });
});
