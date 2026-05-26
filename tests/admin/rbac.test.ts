// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import bcrypt from 'bcryptjs';
import { query } from '../../src/lib/db';
import {
  adminFetch,
  adminLogin,
  createThrowawayAdmin,
  ensureServerReachable,
  nanoid,
  type AdminCtx,
  type ThrowawayAdmin,
} from './_helpers';

let superAdmin: ThrowawayAdmin;
let editor: ThrowawayAdmin;
let contributor: ThrowawayAdmin;
let superCtx: AdminCtx;
let editorCtx: AdminCtx;
let contributorCtx: AdminCtx;

const createdEventIds: string[] = [];
const createdMemberIds: string[] = [];

async function createThrowawayMember(): Promise<string> {
  const email = `qa-rbac-member-${nanoid(8)}@test.local`;
  const hash = await bcrypt.hash('Member!Pass123', 10);
  const rows = await query<{ id: string }>(
    `INSERT INTO members (
        email, password_hash, first_name, last_name,
        email_verified_at
      ) VALUES ($1, $2, $3, $4, now())
      RETURNING id`,
    [email, hash, 'QA', 'RbacMember'],
  );
  const id = rows[0].id;
  createdMemberIds.push(id);
  return id;
}

function eventBody(suffix: string, overrides?: Record<string, unknown>): Record<string, unknown> {
  return {
    title: `QA RBAC Event ${suffix}`,
    slug: `qa-rbac-${suffix}-${nanoid(6)}`,
    description_md: 'RBAC test — auto-deleted.',
    starts_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'other',
    ...overrides,
  };
}

beforeAll(async () => {
  await ensureServerReachable();
  superAdmin = await createThrowawayAdmin('super_admin');
  editor = await createThrowawayAdmin('editor');
  contributor = await createThrowawayAdmin('contributor');
  superCtx = await adminLogin(superAdmin.email, superAdmin.password);
  editorCtx = await adminLogin(editor.email, editor.password);
  contributorCtx = await adminLogin(contributor.email, contributor.password);
});

afterAll(async () => {
  if (createdEventIds.length > 0) {
    await query(`DELETE FROM rsvps WHERE event_id = ANY($1::uuid[])`, [createdEventIds]);
    await query(`DELETE FROM events WHERE id = ANY($1::uuid[])`, [createdEventIds]);
  }
  if (createdMemberIds.length > 0) {
    await query(`DELETE FROM members WHERE id = ANY($1::uuid[])`, [createdMemberIds]);
  }
  await superAdmin?.cleanup();
  await editor?.cleanup();
  await contributor?.cleanup();
});

describe('RBAC — super_admin', () => {
  it('can create and publish an event', async () => {
    const res = await adminFetch(
      '/api/admin/events',
      { method: 'POST', body: JSON.stringify(eventBody('super-publish', { status: 'published' })) },
      superCtx,
    );
    expect(res.status).toBe(201);
    const { event } = (await res.json()) as { event: { id: string; status: string } };
    expect(event.status).toBe('published');
    createdEventIds.push(event.id);
  });

  it('can delete an event', async () => {
    const createRes = await adminFetch(
      '/api/admin/events',
      { method: 'POST', body: JSON.stringify(eventBody('super-delete')) },
      superCtx,
    );
    expect(createRes.status).toBe(201);
    const { event } = (await createRes.json()) as { event: { id: string } };

    const delRes = await adminFetch(
      `/api/admin/events/${event.id}`,
      { method: 'DELETE' },
      superCtx,
    );
    expect(delRes.status).toBe(204);
  });

  it('can suspend a member', async () => {
    const memberId = await createThrowawayMember();
    const res = await adminFetch(
      `/api/admin/members/${memberId}/suspend`,
      { method: 'POST' },
      superCtx,
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as { member: { suspended_at: string | null } };
    expect(json.member.suspended_at).toBeTruthy();
  });
});

describe('RBAC — editor', () => {
  it('can create and publish an event', async () => {
    const res = await adminFetch(
      '/api/admin/events',
      {
        method: 'POST',
        body: JSON.stringify(eventBody('editor-publish', { status: 'published' })),
      },
      editorCtx,
    );
    expect(res.status).toBe(201);
    const { event } = (await res.json()) as { event: { id: string; status: string } };
    expect(event.status).toBe('published');
    createdEventIds.push(event.id);
  });

  it('CANNOT suspend a member (403)', async () => {
    const memberId = await createThrowawayMember();
    const res = await adminFetch(
      `/api/admin/members/${memberId}/suspend`,
      { method: 'POST' },
      editorCtx,
    );
    expect(res.status).toBe(403);
  });

  it('CANNOT manage admins — there is no /api/admin/admins endpoint exposed', async () => {
    // The codebase intentionally does not expose an admin-management endpoint
    // over HTTP for editors. Verify the route does not exist (404).
    const res = await adminFetch(
      '/api/admin/admins',
      { method: 'POST', body: JSON.stringify({ email: 'x@y.z' }) },
      editorCtx,
    );
    expect(res.status).toBe(404);
  });
});

describe('RBAC — contributor', () => {
  it("POST event with status='published' is forced to 'draft' (201)", async () => {
    const res = await adminFetch(
      '/api/admin/events',
      {
        method: 'POST',
        body: JSON.stringify(eventBody('contrib-publish', { status: 'published' })),
      },
      contributorCtx,
    );
    expect(res.status).toBe(201);
    const { event } = (await res.json()) as { event: { id: string; status: string } };
    expect(event.status).toBe('draft');
    createdEventIds.push(event.id);
  });

  it('PATCH on an existing event → 403', async () => {
    // create the event as super_admin so contributor has a target to attack
    const createRes = await adminFetch(
      '/api/admin/events',
      { method: 'POST', body: JSON.stringify(eventBody('contrib-patch-target')) },
      superCtx,
    );
    expect(createRes.status).toBe(201);
    const { event } = (await createRes.json()) as { event: { id: string } };
    createdEventIds.push(event.id);

    const patchRes = await adminFetch(
      `/api/admin/events/${event.id}`,
      { method: 'PATCH', body: JSON.stringify({ title: 'contributor-was-here' }) },
      contributorCtx,
    );
    expect(patchRes.status).toBe(403);
  });

  it('DELETE → 403', async () => {
    const createRes = await adminFetch(
      '/api/admin/events',
      { method: 'POST', body: JSON.stringify(eventBody('contrib-delete-target')) },
      superCtx,
    );
    expect(createRes.status).toBe(201);
    const { event } = (await createRes.json()) as { event: { id: string } };
    createdEventIds.push(event.id);

    const delRes = await adminFetch(
      `/api/admin/events/${event.id}`,
      { method: 'DELETE' },
      contributorCtx,
    );
    expect(delRes.status).toBe(403);
  });
});
