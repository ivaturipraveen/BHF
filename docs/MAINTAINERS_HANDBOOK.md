# BHF Maintainer's Handbook

This handbook is for the BHF staff and volunteers who keep the website's content fresh. It assumes you have an admin account at `/admin/login` and that you can read this document on a laptop while clicking around.

If you don't yet have an account, ask a developer to create one for you. Your admin credentials are provided out-of-band by the developer who set up your environment. They are stored in `/home/ubuntu/.bw_env` (which is mode-600 and never committed). If you need them re-issued or rotated, contact the developer.

### First login

On your first login, the system will prompt you to set up 2FA. Do not skip this step. Then change your password by signing out, hitting the forgot-password flow on `/admin/login`, and creating a new strong password.

Most of the work in this guide takes 1–5 minutes per task. Where a step is destructive or affects donations, members, or children, the relevant routes will surface a confirmation prompt.

---

## 1. Add a new event with photo and RSVP capacity

1. Go to **Events** in the sidebar → click **New event** (top-right). `[Screenshot: Events list with New event button highlighted]`
2. Fill in:
   - **Title** — public-facing title (e.g. "Diwali Celebration 2026").
   - **Slug** — auto-populates from the title. Leave it unless you have a reason.
   - **Description (Markdown)** — use the **Preview** toggle to see formatting. Headings (`##`), bullet lists (`- item`), and links (`[label](url)`) all work.
   - **Starts at / Ends at** — local times. The picker is your laptop's timezone.
   - **Location name / address / lat / lng** — lat/lng are optional and used for the map embed.
   - **Type** — choose festival, class, charity, youth, or other.
   - **Status** — leave as **Draft** while you're polishing. Switch to **Published** when ready to go live.
   - **RSVP capacity** — leave blank for unlimited. Enter a number to cap.
   - **Members only** — tick to restrict RSVP to logged-in members.
   - **Members early access at** — set this to a future timestamp to allow members to RSVP first, then open to the public at that time.
   - **Hero image URL** — pick a file in the uploader, wait for the upload, and the URL fills in automatically. `[Screenshot: Hero image picker after upload]`
3. Click **Save**. You land back on the events list. Confirm the new row appears with the right Status.
4. To edit later, click the title in the list.

---

## 2. Upload photos from a recent event to the gallery

1. Go to **Gallery categories** in the sidebar.
2. Find the right album (or create one with **New category** if it doesn't exist).
3. In the row, click **Manage photos →**. `[Screenshot: Gallery row with Manage photos action highlighted]`
4. Under **Bulk upload**, click the file picker and select multiple images at once (Cmd/Ctrl-click in Finder/Explorer).
5. Each upload appears as a card below. Edit:
   - **Caption** — what's happening in the photo.
   - **Photographer credit** — name to display (e.g. "Photo: Priya Patel").
   - **Display order** — lower numbers appear first.
6. Changes save when you click outside the field. Click **Delete** on a card to remove the photo.

---

## 3. Add a new board member or update an existing bio

1. Go to **Leadership** in the sidebar.
2. To add: click **New leader**. To edit: click the name in the list.
3. Fill in:
   - **Name** and **Role / title** (e.g. "Treasurer").
   - **Bio** — 2-3 sentences in plain text.
   - **Section** — Founding, Board, or Working group. The public page groups by section.
   - **Display order** — controls position within the section.
   - **LinkedIn URL** — optional.
   - **Active** — uncheck to hide without deleting.
   - **Photo URL** — use the uploader. 1:1 (square) crops look best.
4. Click **Save**.

---

## 4. Publish a new blog post or community announcement

1. Go to **Blog posts** → **New post**.
2. Fill in:
   - **Title** and **Slug** (auto-populates).
   - **Excerpt** — 1-2 sentence summary shown on the blog index.
   - **Body (Markdown)** — the main story. Use **Preview** to check formatting.
   - **Status** — keep **Draft** until ready, then switch to **Published**. Publishing sets the public `published_at` to now.
   - **Tags** — comma-separated (e.g. `festivals, seva`).
   - **Featured** — pin to the top of the blog index.
   - **Hero image URL** — uploader.
3. Click **Save**.
4. To unpublish, edit the post and change Status back to **Draft**.

---

## 5. Update donation tier amounts

> Note: donation tier amounts are currently defined in code (`src/data/content.ts`). Changing them requires a developer until **Phase 3** ships a settings UI. Email a developer the new tier amounts (e.g. "Sustainer = $25/month, Patron = $50/month, Benefactor = $100/month") and they will deploy the change.

When Phase 3 lands, this section will be replaced with a click-through guide under **Settings → Donations**.

---

## 6. Export member list for newsletter campaign

1. Go to **Members** in the sidebar.
2. Click **Export CSV** (top right). A `members.csv` downloads.
3. Open the CSV in your spreadsheet tool. Filter to `newsletter_opt_in = true` before importing into your mail tool (e.g. Mailchimp). Email addresses for members who did NOT opt in must not be added to marketing lists.
4. If you only want active members, filter `suspended_at = (empty)` as well.

---

## 7. Review and approve community photo submissions

1. Go to **Photo submissions** in the sidebar. Pending submissions show by default.
2. Each row has a small thumbnail, submitter name and email, caption, and submission time.
3. **Approve** — click the saffron **Approve** button. The photo is marked approved.
4. **Reject** — click **Reject**, enter a brief, friendly reason in the modal (this may be emailed to the submitter), and click **Confirm reject**.
5. Use the **Approved** and **Rejected** tabs to see past decisions.

---

## 8. Update homepage featured content

1. Go to **Homepage config** in the sidebar.
2. Update:
   - **Hero image URL** — main hero photo.
   - **Stats** — families served, festivals hosted, youth in programs, seva hours. These appear in the "By the numbers" section.
   - **Featured events** — tick the events that should appear in the homepage carousel.
   - **Featured programs** — same, for programs.
3. Click **Save**. The homepage updates immediately on the next visit.

---

## 9. Upload annual report PDF

1. Go to **Annual reports** → **New report**.
2. Fill in:
   - **Year** (e.g. 2025).
   - **Title** — optional (e.g. "2025 Year in Review").
   - **Display order** — leave 0 unless reordering manually.
   - **PDF URL** — use the file picker, select the PDF. The URL populates automatically.
   - **Cover image URL** — optional, displayed on the annual reports index.
3. Click **Save**.

---

## 10. Suspend a member account

> Only super_admin can suspend/unsuspend. If you're an editor or contributor, this option will not appear.

1. Go to **Members** → click the member's name to open their profile.
2. Click **Suspend** at the top right. Confirm the prompt.
3. Suspended members:
   - Are immediately signed out (next request rejects their session).
   - Cannot log in.
   - Are excluded from the public directory.
   - Still appear in the admin members list with the **Suspended** badge.
4. To restore access, open the profile and click **Unsuspend**.

---

## Troubleshooting

### I can't log in

- Double-check the email and password. Passwords are case-sensitive.
- If you see "Too many attempts", wait 60 seconds and try again — we rate-limit login attempts.
- If you've forgotten your password, ask a developer to reset it. A self-serve password reset for admins is on the roadmap.

### "Invalid CSRF token" appears when I try to save

This usually means your session timed out (admin sessions last 8 hours). The form will retry once automatically; if it fails again, save your work to the clipboard, reload the page, sign in, and re-paste. Your draft is preserved in the browser's sessionStorage across reloads on the same page.

### A photo I uploaded doesn't appear in the preview

- Confirm the file is under 10 MB.
- Allowed types: JPEG, PNG, WebP, AVIF (and PDF for documents). SVG is blocked for security reasons.
- If the file picker says "File content does not match declared type", the file may be corrupted — try re-exporting.

### How do I enable two-factor authentication?

1. Go to **My profile** in the sidebar (super_admin only sidebar section).
2. Click **Generate QR code**.
3. Scan the QR code with Google Authenticator, 1Password, Authy, or any TOTP app.
4. Enter the current 6-digit code from your app and click **Enable 2FA**.
5. On future logins, you'll be asked for the 6-digit code after your password.

To disable, return to **My profile**, enter the current 6-digit code, and click **Disable 2FA**.

### I deleted something by accident

Most deletions go through a confirm prompt. If you confirmed by mistake:
- For events with RSVPs, the system refuses to delete and asks you to **Archive** instead — set status to `archived`.
- For other content, contact a developer with the slug or ID. We retain database snapshots and can usually restore within 24 hours.

### The site is showing stale data after I saved a change

Most admin pages set `dynamic = 'force-dynamic'` so changes show up immediately. If you still see stale data on the public site, hard-refresh (Cmd-Shift-R / Ctrl-Shift-R). Edge caches refresh every few minutes.

---

## Conventions

- **Markdown editor**: every textarea labeled "(Markdown)" supports the same syntax — headings (`#`), bullet lists, links, bold/italic, blockquotes, and tables. Always check **Preview** before saving.
- **Slugs**: lowercase letters, numbers, dashes only. Auto-generated from the title. Don't edit the slug after publishing — it changes the URL and breaks shared links.
- **Display order**: lower numbers appear first. Use `10`, `20`, `30` (not `1`, `2`, `3`) so you can insert items between later without renumbering everything.
- **Draft vs Published**: drafts are invisible to the public. Always start in draft and preview before publishing.
- **Featured**: a flag that surfaces an item on the home page or top of its list. Use sparingly.

---

## Roles at a glance

| Role | Can do |
|---|---|
| **super_admin** | Everything, including suspend members, manage admins, view email log, enable 2FA. |
| **editor** | Create, edit, publish, and delete all content. Cannot suspend members. |
| **contributor** | Create and edit content as drafts only. Cannot publish, delete, or approve photos. |

Your role appears in the top-right of every admin page next to your name.

---

## Getting help

- **Bugs** — open an issue in the BHF GitHub project, or email the developer team.
- **Training** — ask a board member for the recording of the most recent admin walkthrough (we record one per quarter).
- **Urgent issues** — if the public site is broken or showing wrong information, contact the on-call developer via the BHF Slack `#tech-oncall` channel.
