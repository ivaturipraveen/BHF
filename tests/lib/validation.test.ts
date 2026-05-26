import { describe, it, expect } from 'vitest';
import { emailSchema, passwordSchema, uuidSchema } from '@/lib/validation';

describe('validation: emailSchema', () => {
  it('accepts a normal email and lowercases/trims', () => {
    const parsed = emailSchema.parse('  Test@Example.COM ');
    expect(parsed).toBe('test@example.com');
  });

  it.each([
    'not-an-email',
    'foo@',
    '@bar.com',
    'foo bar@baz.com',
    '',
  ])('rejects invalid email: %s', (bad) => {
    expect(() => emailSchema.parse(bad)).toThrow();
  });
});

describe('validation: passwordSchema', () => {
  it('accepts a strong password (>=8, upper, lower, digit)', () => {
    expect(() => passwordSchema.parse('Abcdef12')).not.toThrow();
  });

  it.each([
    ['too short', 'Ab1'],
    ['no upper', 'abcdef12'],
    ['no lower', 'ABCDEF12'],
    ['no digit', 'Abcdefgh'],
  ])('rejects %s', (_, bad) => {
    expect(() => passwordSchema.parse(bad)).toThrow();
  });
});

describe('validation: uuidSchema', () => {
  it('accepts a valid v4 uuid', () => {
    expect(() =>
      uuidSchema.parse('550e8400-e29b-41d4-a716-446655440000'),
    ).not.toThrow();
  });

  it.each(['junk', '1234', '11111111-2222-3333-4444', ''])(
    'rejects junk: %s',
    (bad) => {
      expect(() => uuidSchema.parse(bad)).toThrow();
    },
  );
});
