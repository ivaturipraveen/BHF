import { z } from 'zod';

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(254)
  .email();

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128)
  .refine((v) => /[A-Z]/.test(v), 'Password must contain an uppercase letter')
  .refine((v) => /[a-z]/.test(v), 'Password must contain a lowercase letter')
  .refine((v) => /\d/.test(v), 'Password must contain a digit');

const US_PHONE = /^\+?1?[\s\-.]?\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4}$/;
export const usPhoneSchema = z
  .string()
  .trim()
  .regex(US_PHONE, 'Invalid US phone number');

export const optionalUsPhoneSchema = z
  .union([z.literal(''), usPhoneSchema])
  .optional()
  .transform((v) => (v === '' || v === undefined ? null : v));

export const uuidSchema = z.string().uuid();

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type Email = z.infer<typeof emailSchema>;
export type Password = z.infer<typeof passwordSchema>;
export type UUID = z.infer<typeof uuidSchema>;
