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
} from '../auth/_helpers';

let cookie = '';
let childId: string | null = null;
let enrollmentId: string | null = null;
let youthProgramId: string | null = null;

beforeAll(async () => {
  await ensureServerReachable();
  const { pair } = await loginAndGetCookie(DEMO_EMAIL, DEMO_PASSWORD);
  cookie = pair;

  const rows = await query<{ id: string }>(
    `SELECT id FROM programs WHERE slug = 'writing-and-art-contest' LIMIT 1`,
  );
  youthProgramId = rows[0]?.id ?? null;
  expect(youthProgramId).toBeTruthy();
});

afterAll(async () => {
  // The cascade-delete test removes the child + enrollment, but be defensive.
  if (enrollmentId) {
    await query(`DELETE FROM youth_enrollments WHERE id = $1`, [enrollmentId]);
  }
  if (childId) {
    await query(`DELETE FROM youth_children WHERE id = $1`, [childId]);
  }
});

describe('COPPA compliance — consent metadata + cascade + no child signup', () => {
  it('creates a child and enrolls them with consent', async () => {
    const childRes = await fetch(`${BASE}/api/me/children`, {
      method: 'POST',
      headers: { ...testHeaders(), cookie },
      body: JSON.stringify({
        firstName: 'Coppa',
        lastName: 'Compliant',
        dateOfBirth: '2016-09-09',
      }),
    });
    expect(childRes.status).toBe(201);
    const childJson = (await childRes.json()) as { child: { id: string } };
    childId = childJson.child.id;

    const enrollRes = await fetch(`${BASE}/api/me/enrollments`, {
      method: 'POST',
      headers: {
        ...testHeaders({ 'user-agent': 'CoppaAudit/1.0' }),
        cookie,
      },
      body: JSON.stringify({
        childId,
        programId: youthProgramId,
        consentAcknowledged: true,
      }),
    });
    expect(enrollRes.status).toBe(201);
    const enrollJson = (await enrollRes.json()) as {
      enrollment: { id: string };
    };
    enrollmentId = enrollJson.enrollment.id;
  });

  it('DB row has parental_consent_at / _ip / _user_agent populated', async () => {
    expect(enrollmentId).toBeTruthy();
    const rows = await query<{
      parental_consent_at: Date | null;
      parental_consent_ip: string | null;
      parental_consent_user_agent: string | null;
    }>(
      `SELECT parental_consent_at, parental_consent_ip, parental_consent_user_agent
         FROM youth_enrollments WHERE id = $1`,
      [enrollmentId],
    );
    expect(rows.length).toBe(1);
    expect(rows[0].parental_consent_at).not.toBeNull();
    expect(rows[0].parental_consent_ip).not.toBeNull();
    expect(rows[0].parental_consent_user_agent).not.toBeNull();
    expect(rows[0].parental_consent_user_agent).toContain('CoppaAudit');
  });

  it('GET /api/me/data-export returns youthChildren + youthEnrollments with consent metadata', async () => {
    const res = await fetch(`${BASE}/api/me/data-export`, {
      headers: { ...testHeaders(), cookie },
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      youthChildren?: Array<{ id: string }>;
      youthEnrollments?: Array<{
        id: string;
        parental_consent_at?: string | null;
        parental_consent_ip?: string | null;
        parental_consent_user_agent?: string | null;
      }>;
    };
    expect(Array.isArray(json.youthChildren)).toBe(true);
    expect(Array.isArray(json.youthEnrollments)).toBe(true);
    const exportedChild = json.youthChildren!.find((c) => c.id === childId);
    const exportedEnrollment = json.youthEnrollments!.find(
      (e) => e.id === enrollmentId,
    );
    expect(exportedChild).toBeTruthy();
    expect(exportedEnrollment).toBeTruthy();
    expect(exportedEnrollment!.parental_consent_at).toBeTruthy();
    expect(exportedEnrollment!.parental_consent_ip).toBeTruthy();
    expect(exportedEnrollment!.parental_consent_user_agent).toBeTruthy();
  });

  it('DELETE /api/me/children/[id] cascades — enrollment row is gone', async () => {
    expect(childId && enrollmentId).toBeTruthy();
    const res = await fetch(`${BASE}/api/me/children/${childId}`, {
      method: 'DELETE',
      headers: { ...testHeaders(), cookie },
    });
    expect(res.status).toBe(204);

    const rows = await query(
      `SELECT id FROM youth_enrollments WHERE id = $1`,
      [enrollmentId],
    );
    expect(rows.length).toBe(0);
    // Null out the local refs so afterAll doesn't try to delete twice.
    enrollmentId = null;
    childId = null;
  });

  it('no /api/auth/signup-child endpoint — request returns 404', async () => {
    const res = await fetch(`${BASE}/api/auth/signup-child`, {
      method: 'POST',
      headers: testHeaders(),
      body: JSON.stringify({
        email: qaEmail('childacct'),
        password: 'Whatever123!',
        firstName: 'Some',
        lastName: 'Kid',
      }),
    });
    expect(res.status).toBe(404);
  });

  it('POST /api/auth/signup does NOT accept a childData payload (ignored or rejected)', async () => {
    // Existing /api/auth/signup uses a strict zod schema; arbitrary keys like
    // childData are simply not in the schema. To prove no child rows can be
    // smuggled in, we submit a payload that includes childData and verify:
    //   (a) the call returns 200 (signup accepted minus unknown keys), AND
    //   (b) the corresponding member has zero youth_children rows.
    const email = qaEmail('coppa-signup');
    const signupRes = await fetch(`${BASE}/api/auth/signup`, {
      method: 'POST',
      headers: testHeaders(),
      body: JSON.stringify({
        email,
        password: 'Whatever123!',
        firstName: 'Parent',
        lastName: 'Tester',
        childData: {
          firstName: 'Ignored',
          lastName: 'Child',
          dateOfBirth: '2018-01-01',
        },
      }),
    });
    expect(signupRes.status).toBe(200);

    const rows = await query<{ id: string }>(
      `SELECT id FROM members WHERE email = $1`,
      [email],
    );
    if (rows.length > 0) {
      const memberId = rows[0].id;
      const kids = await query(
        `SELECT id FROM youth_children WHERE parent_member_id = $1`,
        [memberId],
      );
      expect(kids.length).toBe(0);
      // Cleanup.
      await query(`DELETE FROM email_log WHERE to_email = $1`, [email]);
      await query(`DELETE FROM members WHERE id = $1`, [memberId]);
    }
  });
});
