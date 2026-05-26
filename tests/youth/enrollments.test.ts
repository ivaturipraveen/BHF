// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { query } from '../../src/lib/db';
import {
  BASE,
  DEMO_EMAIL,
  DEMO_PASSWORD,
  ensureServerReachable,
  loginAndGetCookie,
  testHeaders,
  qaEmail,
  createVerifiedMember,
  deleteMemberByEmail,
} from '../auth/_helpers';
import { hashPassword } from '../../src/lib/auth';

let demoCookie = '';
let throwawayCookie = '';
let throwawayEmail = '';
const childIds: string[] = [];
let primaryChildId: string | null = null;
let secondaryChildId: string | null = null;
let primaryEnrollmentId: string | null = null;
let youthProgramId: string | null = null;
let youthProgramMin6Id: string | null = null;
let nonYouthProgramId: string | null = null;

async function createChild(args: {
  cookie: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}): Promise<string> {
  const res = await fetch(`${BASE}/api/me/children`, {
    method: 'POST',
    headers: { ...testHeaders(), cookie: args.cookie },
    body: JSON.stringify({
      firstName: args.firstName,
      lastName: args.lastName,
      dateOfBirth: args.dateOfBirth,
    }),
  });
  if (res.status !== 201) {
    const body = await res.text();
    throw new Error(`createChild failed: ${res.status} ${body}`);
  }
  const json = (await res.json()) as { child: { id: string } };
  return json.child.id;
}

beforeAll(async () => {
  await ensureServerReachable();
  const { pair } = await loginAndGetCookie(DEMO_EMAIL, DEMO_PASSWORD);
  demoCookie = pair;

  // Look up two youth programs (writing contest = min age 6, student-boards = min age 12)
  // and one non-youth program (yoga-meditation).
  const wcRows = await query<{ id: string }>(
    `SELECT id FROM programs WHERE slug = 'writing-and-art-contest' LIMIT 1`,
  );
  youthProgramId = wcRows[0]?.id ?? null;
  youthProgramMin6Id = youthProgramId; // same program, named for clarity in age test
  const ymRows = await query<{ id: string }>(
    `SELECT id FROM programs WHERE slug = 'yoga-meditation' LIMIT 1`,
  );
  nonYouthProgramId = ymRows[0]?.id ?? null;
  expect(youthProgramId).toBeTruthy();
  expect(nonYouthProgramId).toBeTruthy();
});

afterAll(async () => {
  if (primaryEnrollmentId) {
    await query(`DELETE FROM youth_enrollments WHERE id = $1`, [
      primaryEnrollmentId,
    ]);
  }
  if (childIds.length > 0) {
    await query(`DELETE FROM youth_children WHERE id = ANY($1::uuid[])`, [
      childIds,
    ]);
  }
  if (throwawayEmail) {
    await deleteMemberByEmail(throwawayEmail);
  }
});

describe('/api/me/enrollments — youth enrollment lifecycle', () => {
  it('creates a child aged ~10 (DOB 2015-06-12)', async () => {
    primaryChildId = await createChild({
      cookie: demoCookie,
      firstName: 'Enroll',
      lastName: 'Kid',
      dateOfBirth: '2015-06-12',
    });
    expect(primaryChildId).toBeTruthy();
    childIds.push(primaryChildId!);
  });

  it('POST /api/me/enrollments with consent → 201 + consent metadata populated', async () => {
    expect(primaryChildId && youthProgramId).toBeTruthy();
    const res = await fetch(`${BASE}/api/me/enrollments`, {
      method: 'POST',
      headers: {
        ...testHeaders({
          'user-agent': 'QA-Tester/1.0 (vitest)',
        }),
        cookie: demoCookie,
      },
      body: JSON.stringify({
        childId: primaryChildId,
        programId: youthProgramId,
        consentAcknowledged: true,
      }),
    });
    expect(res.status).toBe(201);
    const json = (await res.json()) as {
      enrollment: {
        id: string;
        status: string;
        parentalConsentAt: string | null;
      };
    };
    const rawEnrollment = (json as unknown as {
      enrollment: Record<string, unknown>;
    }).enrollment;
    expect(json.enrollment.status).toBe('enrolled');
    expect(json.enrollment.parentalConsentAt).toBeTruthy();
    // RILEY L1: the public response must NOT echo the audit-trail IP/UA.
    // The DB row still has them populated (proven in coppa.test.ts).
    expect('parentalConsentIp' in rawEnrollment).toBe(false);
    expect('parentalConsentUserAgent' in rawEnrollment).toBe(false);
    primaryEnrollmentId = json.enrollment.id;
  });

  it('POSTing same child+program again → 409 already_enrolled', async () => {
    const res = await fetch(`${BASE}/api/me/enrollments`, {
      method: 'POST',
      headers: { ...testHeaders(), cookie: demoCookie },
      body: JSON.stringify({
        childId: primaryChildId,
        programId: youthProgramId,
        consentAcknowledged: true,
      }),
    });
    expect(res.status).toBe(409);
    const json = (await res.json()) as { error?: string };
    expect(json.error).toBe('already_enrolled');
  });

  it('POST with a non-youth program → 400 program_invalid', async () => {
    const res = await fetch(`${BASE}/api/me/enrollments`, {
      method: 'POST',
      headers: { ...testHeaders(), cookie: demoCookie },
      body: JSON.stringify({
        childId: primaryChildId,
        programId: nonYouthProgramId,
        consentAcknowledged: true,
      }),
    });
    expect(res.status).toBe(400);
    const json = (await res.json()) as { error?: string };
    expect(json.error).toBe('program_invalid');
  });

  it('POST with consentAcknowledged=false → 400 parental_consent_required', async () => {
    const res = await fetch(`${BASE}/api/me/enrollments`, {
      method: 'POST',
      headers: { ...testHeaders(), cookie: demoCookie },
      body: JSON.stringify({
        childId: primaryChildId,
        programId: youthProgramId,
        consentAcknowledged: false,
      }),
    });
    expect(res.status).toBe(400);
  });

  it('creates a second child aged ~5 (DOB 2020-08-10) → enroll in writing contest (min 6) → 400 age_ineligible', async () => {
    secondaryChildId = await createChild({
      cookie: demoCookie,
      firstName: 'Too',
      lastName: 'Young',
      dateOfBirth: '2020-08-10',
    });
    childIds.push(secondaryChildId);

    const res = await fetch(`${BASE}/api/me/enrollments`, {
      method: 'POST',
      headers: { ...testHeaders(), cookie: demoCookie },
      body: JSON.stringify({
        childId: secondaryChildId,
        programId: youthProgramMin6Id,
        consentAcknowledged: true,
      }),
    });
    expect(res.status).toBe(400);
    const json = (await res.json()) as { error?: string };
    expect(json.error).toBe('age_ineligible');
  });

  it('GET /api/me/enrollments → 200 with active enrollment listed', async () => {
    const res = await fetch(`${BASE}/api/me/enrollments`, {
      headers: { ...testHeaders(), cookie: demoCookie },
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      enrollments: Array<{ id: string; status: string }>;
    };
    const found = json.enrollments.find((e) => e.id === primaryEnrollmentId);
    expect(found).toBeTruthy();
    expect(found!.status).toBe('enrolled');
  });

  it('DELETE /api/me/enrollments/[id] → 200 with status=withdrawn', async () => {
    expect(primaryEnrollmentId).toBeTruthy();
    const res = await fetch(
      `${BASE}/api/me/enrollments/${primaryEnrollmentId}`,
      {
        method: 'DELETE',
        headers: { ...testHeaders(), cookie: demoCookie },
      },
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as { ok?: boolean; status?: string };
    expect(json.ok).toBe(true);
    expect(json.status).toBe('withdrawn');
  });

  it('GET /api/me/enrollments → withdrawn enrollment still visible', async () => {
    const res = await fetch(`${BASE}/api/me/enrollments`, {
      headers: { ...testHeaders(), cookie: demoCookie },
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      enrollments: Array<{ id: string; status: string }>;
    };
    const found = json.enrollments.find((e) => e.id === primaryEnrollmentId);
    expect(found).toBeTruthy();
    expect(found!.status).toBe('withdrawn');
  });

  it('cross-account: throwaway member cannot read or enroll demo’s child', async () => {
    throwawayEmail = qaEmail('qa-youth-cross');
    const passwordHash = await hashPassword('Tossable123!');
    await createVerifiedMember({
      email: throwawayEmail,
      passwordHash,
      firstName: 'Cross',
      lastName: 'Sneak',
    });
    const { pair } = await loginAndGetCookie(throwawayEmail, 'Tossable123!');
    throwawayCookie = pair;

    // GET demo's child as throwaway → 404 (not 200/403; parent isolation)
    const readRes = await fetch(
      `${BASE}/api/me/children/${primaryChildId}`,
      { headers: { ...testHeaders(), cookie: throwawayCookie } },
    );
    expect(readRes.status).toBe(404);

    // POST enrollment for demo's child as throwaway → 403 forbidden
    const enrollRes = await fetch(`${BASE}/api/me/enrollments`, {
      method: 'POST',
      headers: { ...testHeaders(), cookie: throwawayCookie },
      body: JSON.stringify({
        childId: primaryChildId,
        programId: youthProgramId,
        consentAcknowledged: true,
      }),
    });
    expect(enrollRes.status).toBe(403);
    const json = (await enrollRes.json()) as { error?: string };
    expect(json.error).toBe('forbidden');
  });
});
