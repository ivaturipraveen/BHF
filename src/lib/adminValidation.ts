import slugifyLib from 'slugify';
import { z } from 'zod';

export function slugify(value: string): string {
  return slugifyLib(value, { lower: true, strict: true, trim: true });
}

export const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, 'Invalid slug');

export const statusSchema = z.enum(['draft', 'published', 'archived']);

export const uuidParamSchema = z.string().uuid();
