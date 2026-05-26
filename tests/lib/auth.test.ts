// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';

vi.mock('next/headers', () => ({
  cookies: () => ({ get: () => undefined }),
}));

import {
  hashPassword,
  verifyPassword,
  signSessionToken,
  verifySessionToken,
} from '@/lib/auth';

describe('auth: password hashing', () => {
  it('hashPassword produces different hashes for the same input (salt)', async () => {
    const plain = 'CorrectHorse9';
    const h1 = await hashPassword(plain);
    const h2 = await hashPassword(plain);
    expect(h1).not.toEqual(h2);
    expect(h1).toMatch(/^\$2[aby]\$/);
    expect(h2).toMatch(/^\$2[aby]\$/);
  });

  it('verifyPassword returns true for matching, false for non-matching', async () => {
    const plain = 'CorrectHorse9';
    const hash = await hashPassword(plain);
    await expect(verifyPassword(plain, hash)).resolves.toBe(true);
    await expect(verifyPassword('WrongHorse9', hash)).resolves.toBe(false);
  });
});

describe('auth: session token', () => {
  const payload = {
    sub: '11111111-2222-3333-4444-555555555555',
    role: 'member' as const,
    email: 'test@example.com',
  };

  it('signSessionToken + verifySessionToken roundtrip preserves payload', async () => {
    const token = await signSessionToken(payload);
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
    const verified = await verifySessionToken(token);
    expect(verified).not.toBeNull();
    expect(verified!.sub).toBe(payload.sub);
    expect(verified!.role).toBe(payload.role);
    expect(verified!.email).toBe(payload.email);
  });

  it('verifySessionToken returns null for a tampered token', async () => {
    const token = await signSessionToken(payload);
    const parts = token.split('.');
    parts[2] = parts[2].slice(0, -2) + 'xx';
    const tampered = parts.join('.');
    const result = await verifySessionToken(tampered);
    expect(result).toBeNull();
  });

  it('verifySessionToken returns null for an expired token', async () => {
    const token = await signSessionToken(payload, '-1s');
    const result = await verifySessionToken(token);
    expect(result).toBeNull();
  });

  it('verifySessionToken returns null for completely junk input', async () => {
    const result = await verifySessionToken('not-a-real-jwt');
    expect(result).toBeNull();
  });
});
