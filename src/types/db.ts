import { z } from 'zod';

export const memberInterestSchema = z.enum([
  'festivals',
  'youth_programs',
  'seva',
  'classes',
]);
export type MemberInterest = z.infer<typeof memberInterestSchema>;

export const memberSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  password_hash: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  phone: z.string().nullable(),
  city: z.string().nullable(),
  family_size: z.string().nullable(),
  how_heard: z.string().nullable(),
  interests: z.array(memberInterestSchema).nullable(),
  bio: z.string().nullable(),
  photo_url: z.string().nullable(),
  email_verified_at: z.date().nullable(),
  email_verification_token: z.string().nullable(),
  password_reset_token: z.string().nullable(),
  password_reset_expires_at: z.date().nullable(),
  directory_opt_in: z.boolean(),
  newsletter_opt_in: z.boolean(),
  event_reminders_opt_in: z.boolean(),
  donation_receipts_opt_in: z.boolean(),
  member_messages_opt_in: z.boolean(),
  suspended_at: z.date().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});
export type Member = z.infer<typeof memberSchema>;

export const savedEventSchema = z.object({
  id: z.string().uuid(),
  member_id: z.string().uuid(),
  event_id: z.string().uuid(),
  note: z.string().nullable(),
  created_at: z.date(),
});
export type SavedEvent = z.infer<typeof savedEventSchema>;

export const adminRoleSchema = z.enum(['super_admin', 'editor', 'contributor']);
export type AdminRole = z.infer<typeof adminRoleSchema>;

export const adminSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  password_hash: z.string(),
  name: z.string(),
  role: adminRoleSchema,
  totp_secret: z.string().nullable(),
  totp_enabled: z.boolean(),
  last_login_at: z.date().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});
export type Admin = z.infer<typeof adminSchema>;

export const sessionRowSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  user_type: z.enum(['member', 'admin']),
  token_hash: z.string(),
  expires_at: z.date(),
  created_at: z.date(),
  ip: z.string().nullable(),
  user_agent: z.string().nullable(),
});
export type SessionRow = z.infer<typeof sessionRowSchema>;

export const eventStatusSchema = z.enum(['draft', 'published', 'archived']);
export const eventTypeSchema = z.enum([
  'festival',
  'class',
  'charity',
  'youth',
  'other',
]);
export const eventSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  description_md: z.string(),
  starts_at: z.date(),
  ends_at: z.date().nullable(),
  location_name: z.string().nullable(),
  location_address: z.string().nullable(),
  location_lat: z.number().nullable(),
  location_lng: z.number().nullable(),
  hero_image_url: z.string().nullable(),
  type: eventTypeSchema.nullable(),
  status: eventStatusSchema,
  rsvp_capacity: z.number().int().nullable(),
  members_only: z.boolean(),
  // members_early_access_at: timestamp when PUBLIC RSVP opens. Until that moment, only logged-in members can RSVP.
  // Set this in the FUTURE to gate public RSVP; leave NULL to allow public RSVP from publication.
  members_early_access_at: z.date().nullable(),
  allows_dietary_restrictions: z.boolean(),
  created_at: z.date(),
  updated_at: z.date(),
});
export type Event = z.infer<typeof eventSchema>;

export const rsvpSchema = z.object({
  id: z.string().uuid(),
  event_id: z.string().uuid(),
  member_id: z.string().uuid().nullable(),
  name: z.string(),
  email: z.string().email(),
  party_size: z.number().int(),
  dietary_restrictions: z.string().nullable(),
  created_at: z.date(),
});
export type Rsvp = z.infer<typeof rsvpSchema>;

export const programCategorySchema = z.enum([
  'cultural',
  'educational',
  'charitable',
  'wellness',
  'youth',
]);
export const programFrequencySchema = z.enum(['monthly', 'annual', 'rolling']);
export const programStatusSchema = z.enum(['draft', 'published', 'archived']);
export const programSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  category: programCategorySchema,
  frequency: programFrequencySchema,
  description_md: z.string(),
  short_description: z.string(),
  who_for: z.string().nullable(),
  schedule_md: z.string().nullable(),
  cost_md: z.string().nullable(),
  location: z.string().nullable(),
  hero_image_url: z.string().nullable(),
  featured: z.boolean(),
  display_order: z.number().int(),
  status: programStatusSchema,
  min_age_years: z.number().int().nullable(),
  max_age_years: z.number().int().nullable(),
  is_youth: z.boolean(),
  created_at: z.date(),
  updated_at: z.date(),
});
export type Program = z.infer<typeof programSchema>;

export const galleryCategorySchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  cover_image_url: z.string().nullable(),
  display_order: z.number().int(),
  created_at: z.date(),
});
export type GalleryCategory = z.infer<typeof galleryCategorySchema>;

export const galleryPhotoSchema = z.object({
  id: z.string().uuid(),
  category_id: z.string().uuid().nullable(),
  file_url: z.string(),
  thumb_url: z.string().nullable(),
  caption: z.string().nullable(),
  photographer_credit: z.string().nullable(),
  taken_at: z.date().nullable(),
  display_order: z.number().int(),
  created_at: z.date(),
});
export type GalleryPhoto = z.infer<typeof galleryPhotoSchema>;

export const leadershipSectionSchema = z.enum([
  'founding',
  'board',
  'working_group',
]);
export const leadershipSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  role: z.string(),
  bio: z.string(),
  photo_url: z.string().nullable(),
  linkedin_url: z.string().nullable(),
  section: leadershipSectionSchema,
  display_order: z.number().int(),
  active: z.boolean(),
  created_at: z.date(),
  updated_at: z.date(),
});
export type Leadership = z.infer<typeof leadershipSchema>;

export const blogPostStatusSchema = z.enum(['draft', 'published', 'archived']);
export const blogPostSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  excerpt: z.string(),
  body_md: z.string(),
  hero_image_url: z.string().nullable(),
  author_id: z.string().uuid().nullable(),
  tags: z.array(z.string()).nullable(),
  featured: z.boolean(),
  status: blogPostStatusSchema,
  published_at: z.date().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});
export type BlogPost = z.infer<typeof blogPostSchema>;

export const sponsorSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  tier: z.string().nullable(),
  logo_url: z.string(),
  website_url: z.string().nullable(),
  display_order: z.number().int(),
  active: z.boolean(),
  created_at: z.date(),
});
export type Sponsor = z.infer<typeof sponsorSchema>;

export const annualReportSchema = z.object({
  id: z.string().uuid(),
  year: z.number().int(),
  title: z.string().nullable(),
  pdf_url: z.string(),
  cover_image_url: z.string().nullable(),
  display_order: z.number().int(),
  created_at: z.date(),
});
export type AnnualReport = z.infer<typeof annualReportSchema>;

export const exclusiveContentCategorySchema = z.enum([
  'yoga',
  'vedic_chanting',
  'bharatiyatha_lecture',
  'festival_recording',
  'magazine',
  'other',
]);
export const exclusiveContentTypeSchema = z.enum(['video', 'pdf', 'audio']);
export const exclusiveContentSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  category: exclusiveContentCategorySchema,
  content_type: exclusiveContentTypeSchema,
  content_url: z.string(),
  thumbnail_url: z.string().nullable(),
  duration_seconds: z.number().int().nullable(),
  published_at: z.date(),
  created_at: z.date(),
  updated_at: z.date(),
});
export type ExclusiveContent = z.infer<typeof exclusiveContentSchema>;

export const youthChildSchema = z.object({
  id: z.string().uuid(),
  parent_member_id: z.string().uuid(),
  first_name: z.string(),
  last_name: z.string(),
  date_of_birth: z.date(),
  allergies: z.string().nullable(),
  emergency_contact_name: z.string().nullable(),
  emergency_contact_phone: z.string().nullable(),
  photo_permission: z.boolean(),
  created_at: z.date(),
  updated_at: z.date(),
});
export type YouthChild = z.infer<typeof youthChildSchema>;

export const youthEnrollmentStatusSchema = z.enum([
  'enrolled',
  'withdrawn',
  'completed',
]);
export const youthEnrollmentSchema = z.object({
  id: z.string().uuid(),
  child_id: z.string().uuid().nullable(),
  program_id: z.string().uuid().nullable(),
  parental_consent_at: z.date(),
  parental_consent_ip: z.string().nullable(),
  parental_consent_user_agent: z.string().nullable(),
  status: youthEnrollmentStatusSchema,
  created_at: z.date(),
  updated_at: z.date(),
});
export type YouthEnrollment = z.infer<typeof youthEnrollmentSchema>;

export const donationTypeSchema = z.enum(['one_time', 'monthly', 'yearly']);
export const donationStatusSchema = z.enum([
  'pending',
  'succeeded',
  'failed',
  'refunded',
  'canceled',
]);
export const donationSchema = z.object({
  id: z.string().uuid(),
  member_id: z.string().uuid().nullable(),
  stripe_session_id: z.string().nullable(),
  stripe_payment_intent_id: z.string().nullable(),
  stripe_subscription_id: z.string().nullable(),
  amount_cents: z.number().int(),
  currency: z.string(),
  type: donationTypeSchema,
  status: donationStatusSchema,
  donor_name: z.string(),
  donor_email: z.string().email(),
  donor_address: z.string().nullable(),
  in_honor_of: z.string().nullable(),
  receipt_url: z.string().nullable(),
  receipt_sent_at: z.date().nullable(),
  idempotency_key: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  mode: z.enum(['live', 'stub']),
  created_at: z.date(),
  updated_at: z.date(),
});
export type Donation = z.infer<typeof donationSchema>;

export const photoSubmissionStatusSchema = z.enum([
  'pending',
  'approved',
  'rejected',
]);
export const photoSubmissionSchema = z.object({
  id: z.string().uuid(),
  submitter_name: z.string().nullable(),
  submitter_email: z.string().email().nullable(),
  event_id: z.string().uuid().nullable(),
  file_url: z.string(),
  caption: z.string().nullable(),
  status: photoSubmissionStatusSchema,
  reviewed_by: z.string().uuid().nullable(),
  review_note: z.string().nullable(),
  created_at: z.date(),
  reviewed_at: z.date().nullable(),
});
export type PhotoSubmission = z.infer<typeof photoSubmissionSchema>;

export const contactInquiryTypeSchema = z.enum([
  'volunteer',
  'sponsor',
  'general',
  'press',
  'planned_giving',
]);
export const contactInquiryStatusSchema = z.enum(['new', 'contacted', 'closed']);
export const contactInquirySchema = z.object({
  id: z.string().uuid(),
  type: contactInquiryTypeSchema,
  name: z.string().nullable(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  company: z.string().nullable(),
  message: z.string(),
  additional_data: z.unknown().nullable(),
  status: contactInquiryStatusSchema,
  handled_by: z.string().uuid().nullable(),
  handled_at: z.date().nullable(),
  created_at: z.date(),
});
export type ContactInquiry = z.infer<typeof contactInquirySchema>;

export const newsletterSubscriberSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  source: z.string().nullable(),
  confirmed_at: z.date().nullable(),
  unsubscribed_at: z.date().nullable(),
  created_at: z.date(),
});
export type NewsletterSubscriber = z.infer<typeof newsletterSubscriberSchema>;

export const pageSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string().nullable(),
  body_md: z.string().nullable(),
  meta_title: z.string().nullable(),
  meta_description: z.string().nullable(),
  updated_by: z.string().uuid().nullable(),
  updated_at: z.date(),
  created_at: z.date(),
});
export type Page = z.infer<typeof pageSchema>;

export const homepageConfigSchema = z.object({
  id: z.literal(1),
  featured_event_ids: z.array(z.string().uuid()).nullable(),
  featured_program_ids: z.array(z.string().uuid()).nullable(),
  hero_image_url: z.string().nullable(),
  stat_families_served: z.number().int(),
  stat_festivals_hosted: z.number().int(),
  stat_youth_in_programs: z.number().int(),
  stat_seva_hours: z.number().int(),
  updated_at: z.date(),
});
export type HomepageConfig = z.infer<typeof homepageConfigSchema>;
