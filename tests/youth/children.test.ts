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
} from '../auth/_helpers';

let cookie = '';
let createdChildId: string | null = null;
const createdIds: string[] = [];

beforeAll(async () => {
  await ensureServerReachable();
  const { pair } = await loginAndGetCookie(DEMO_EMAIL, DEMO_PASSWORD);
  cookie = pair;
});

afterAll(async () => {
  if (createdIds.length > 0) {
    await query(`DELETE FROM youth_children WHERE id = ANY($1::uuid[])`, [
      createdIds,
    ]);
  }
});

describe('/api/me/children — CRUD + COPPA auth', () => {
  it('GET without cookie → 401', async () => {
    const res = await fetch(`${BASE}/api/me/children`, {
      headers: testHeaders(),
    });
    expect(res.status).toBe(401);
  });

  it('POST without cookie → 401', async () => {
    const res = await fetch(`${BASE}/api/me/children`, {
      method: 'POST',
      headers: testHeaders(),
      body: JSON.stringify({
        firstName: 'Anon',
        lastName: 'Child',
        dateOfBirth: '2018-01-01',
      }),
    });
    expect(res.status).toBe(401);
  });

  it('POST /api/me/children with valid body → 201 and returns child', async () => {
    const res = await fetch(`${BASE}/api/me/children`, {
      method: 'POST',
      headers: { ...testHeaders(), cookie },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'Child',
        dateOfBirth: '2018-03-15',
        allergies: 'none',
        photoPermission: true,
      }),
    });
    expect(res.status).toBe(201);
    const json = (await res.json()) as {
      child: {
        id: string;
        firstName: string;
        lastName: string;
        photoPermission: boolean;
      };
    };
    expect(json.child).toBeTruthy();
    expect(json.child.firstName).toBe('Test');
    expect(json.child.lastName).toBe('Child');
    expect(json.child.photoPermission).toBe(true);
    createdChildId = json.child.id;
    createdIds.push(json.child.id);
  });

  it('GET /api/me/children → 200 with array containing the created child', async () => {
    const res = await fetch(`${BASE}/api/me/children`, {
      headers: { ...testHeaders(), cookie },
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      children: Array<{ id: string }>;
    };
    expect(Array.isArray(json.children)).toBe(true);
    const ids = json.children.map((c) => c.id);
    expect(ids).toContain(createdChildId);
  });

  it('GET /api/me/children/[id] with cookie → 200 with matching fields', async () => {
    expect(createdChildId).toBeTruthy();
    const res = await fetch(`${BASE}/api/me/children/${createdChildId}`, {
      headers: { ...testHeaders(), cookie },
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      child: {
        id: string;
        firstName: string;
        lastName: string;
        allergies: string | null;
        photoPermission: boolean;
      };
    };
    expect(json.child.id).toBe(createdChildId);
    expect(json.child.firstName).toBe('Test');
    expect(json.child.lastName).toBe('Child');
    expect(json.child.allergies).toBe('none');
    expect(json.child.photoPermission).toBe(true);
  });

  it('GET /api/me/children/[id] without cookie → 401', async () => {
    expect(createdChildId).toBeTruthy();
    const res = await fetch(`${BASE}/api/me/children/${createdChildId}`, {
      headers: testHeaders(),
    });
    expect(res.status).toBe(401);
  });

  it('GET /api/me/children/[bogus-uuid] → 404', async () => {
    const bogus = '00000000-0000-0000-0000-000000000000';
    const res = await fetch(`${BASE}/api/me/children/${bogus}`, {
      headers: { ...testHeaders(), cookie },
    });
    expect(res.status).toBe(404);
  });

  it('PATCH /api/me/children/[id] updates allergies → 200', async () => {
    expect(createdChildId).toBeTruthy();
    const res = await fetch(`${BASE}/api/me/children/${createdChildId}`, {
      method: 'PATCH',
      headers: { ...testHeaders(), cookie },
      body: JSON.stringify({ allergies: 'peanuts' }),
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      child: { allergies: string | null };
    };
    expect(json.child.allergies).toBe('peanuts');
  });

  it('POST with future date_of_birth → 400', async () => {
    const res = await fetch(`${BASE}/api/me/children`, {
      method: 'POST',
      headers: { ...testHeaders(), cookie },
      body: JSON.stringify({
        firstName: 'Future',
        lastName: 'Kid',
        dateOfBirth: '2030-01-01',
      }),
    });
    expect(res.status).toBe(400);
  });

  it('POST with date_of_birth way in the past (age > 21) → 400', async () => {
    const res = await fetch(`${BASE}/api/me/children`, {
      method: 'POST',
      headers: { ...testHeaders(), cookie },
      body: JSON.stringify({
        firstName: 'Too',
        lastName: 'Old',
        dateOfBirth: '1980-01-01',
      }),
    });
    expect(res.status).toBe(400);
  });

  it('POST with missing firstName → 400', async () => {
    const res = await fetch(`${BASE}/api/me/children`, {
      method: 'POST',
      headers: { ...testHeaders(), cookie },
      body: JSON.stringify({
        lastName: 'NoFirst',
        dateOfBirth: '2018-03-15',
      }),
    });
    expect(res.status).toBe(400);
  });

  it('DELETE /api/me/children/[id] → 204', async () => {
    expect(createdChildId).toBeTruthy();
    const res = await fetch(`${BASE}/api/me/children/${createdChildId}`, {
      method: 'DELETE',
      headers: { ...testHeaders(), cookie },
    });
    expect(res.status).toBe(204);
  });

  it('GET /api/me/children/[id] after delete → 404', async () => {
    expect(createdChildId).toBeTruthy();
    const res = await fetch(`${BASE}/api/me/children/${createdChildId}`, {
      headers: { ...testHeaders(), cookie },
    });
    expect(res.status).toBe(404);
  });
});
