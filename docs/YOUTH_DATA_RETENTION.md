# Youth Data Retention Policy

**Last updated:** 2026-05-25
**Applies to:** `youth_children` and `youth_enrollments` records collected through BHF account features.

## Summary

Youth profiles and enrollments are retained for **7 years** (record-keeping for child-protection compliance).

## Deletion paths

- **Parent account deletion.** When a parent's `members` row is removed, all linked children's PII is deleted via the `parent_member_id` foreign-key CASCADE on `youth_children`. The cascade chains to `youth_enrollments` (also CASCADE), so no orphaned youth data remains.
- **Individual child deletion.** When a parent deletes a single child profile (`DELETE /api/me/children/:id`), the child profile and all of that child's enrollments are removed via the `child_id` FK CASCADE on `youth_enrollments`.
- **Enrollment withdrawal.** A withdrawn enrollment (`DELETE /api/me/enrollments/:id`) is *not* deleted; it transitions to `status='withdrawn'` and remains in the table for compliance/audit purposes until the 7-year retention window expires.

## Parent rights

- **Export.** Parents may request a full export of their and their children's records at any time via `/account/data-export`. The export includes child profile fields and enrollment records (program, status, parental-consent timestamp/IP/user-agent).
- **Correction.** Parents may correct child profile fields via `PATCH /api/me/children/:id`.
- **Deletion.** Parents may delete a child profile (and all of that child's enrollments) at any time via `DELETE /api/me/children/:id`.

## COPPA notes

- All youth data is parent-managed — there are no direct child accounts and no auth columns on `youth_children`.
- Explicit parental consent is captured at the moment of enrollment with timestamp, IP address, and user-agent (`parental_consent_at`, `parental_consent_ip`, `parental_consent_user_agent`).
- The IP and user-agent are stored exactly as received and are not normalized.

## Photo permission

The youth_children.photo_permission column captures explicit parental consent for photographing the child during BHF programs and events. Any future media-display surface (gallery, event recap pages, social media exports, etc.) that may include identifiable youth subjects MUST filter on photo_permission = true before publishing the image. This applies whether the image comes from BHF's seeded gallery, a community photo submission tied to a youth program, or any admin-published media.

When in doubt, exclude the image.
