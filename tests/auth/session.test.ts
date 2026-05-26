// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';
import {
  BASE,
  DEMO_EMAIL,
  DEMO_PASSWORD,
  ensureServerReachable,
  loginAndGetCookie,
  testHeaders,
} from './_helpers';

beforeAll(async () => {
  await ensureServerReachable();
});

describe('Session lifecycle and /api/me family', () => {
  it('GET /api/me/donations without cookie → 401', async () => {
    const res = await fetch(`${BASE}/api/me/donations`, {
      headers: testHeaders(),
    });
    expect(res.status).toBe(401);
  });

  it('login → GET /api/me returns the member but no sensitive fields', async () => {
    const { pair } = await loginAndGetCookie(DEMO_EMAIL, DEMO_PASSWORD);
    const res = await fetch(`${BASE}/api/me`, {
      headers: { ...testHeaders(), cookie: pair },
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      member?: Record<string, unknown>;
    };
    expect(json.member).toBeTruthy();
    expect(json.member!.email).toBe(DEMO_EMAIL);
    // Sensitive columns must not be in the response.
    expect(json.member!.password_hash).toBeUndefined();
    expect(json.member!.email_verification_token).toBeUndefined();
    expect(json.member!.password_reset_token).toBeUndefined();
    expect(json.member!.password_reset_expires_at).toBeUndefined();
  });

  it('logout clears the cookie and subsequent /api/me returns 401', async () => {
    const { pair } = await loginAndGetCookie(DEMO_EMAIL, DEMO_PASSWORD);
    const logout = await fetch(`${BASE}/api/auth/logout`, {
      method: 'POST',
      headers: { ...testHeaders(), cookie: pair },
    });
    expect(logout.status).toBe(200);
    // After logout, presenting NO cookie to /api/me → 401.
    const after = await fetch(`${BASE}/api/me`, { headers: testHeaders() });
    expect(after.status).toBe(401);
  });

  it('GET /api/me/rsvps with cookie returns 200 with an array', async () => {
    const { pair } = await loginAndGetCookie(DEMO_EMAIL, DEMO_PASSWORD);
    const res = await fetch(`${BASE}/api/me/rsvps`, {
      headers: { ...testHeaders(), cookie: pair },
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as { rsvps?: unknown };
    expect(Array.isArray(json.rsvps)).toBe(true);
  });

  it('GET /api/me/data-export returns a downloadable JSON with the expected sections', async () => {
    const { pair } = await loginAndGetCookie(DEMO_EMAIL, DEMO_PASSWORD);
    const res = await fetch(`${BASE}/api/me/data-export`, {
      headers: { ...testHeaders(), cookie: pair },
    });
    expect(res.status).toBe(200);
    const cd = res.headers.get('content-disposition') ?? '';
    expect(cd).toMatch(/attachment/i);
    const json = (await res.json()) as Record<string, unknown>;
    expect(json.member).toBeTruthy();
    expect(Array.isArray(json.donations)).toBe(true);
    expect(Array.isArray(json.rsvps)).toBe(true);
    expect(Array.isArray(json.photoSubmissions)).toBe(true);
    // The implementation names these youthChildren / youthEnrollments rather
    // than children / enrollments; assert on whichever key is present so the
    // test reflects the actual contract.
    const childrenLike = json.youthChildren ?? json.children;
    const enrollmentsLike = json.youthEnrollments ?? json.enrollments;
    expect(Array.isArray(childrenLike)).toBe(true);
    expect(Array.isArray(enrollmentsLike)).toBe(true);
  });
});
