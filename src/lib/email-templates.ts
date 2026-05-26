import 'server-only';
import { LEGAL_NAME } from '@/lib/config/donations';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

const INDIGO = '#1E3A5F';
const SAFFRON = '#D97706';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function shell(headline: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${escapeHtml(headline)}</title>
</head>
<body style="margin:0;padding:0;background:#f6f5f1;font-family:Arial,Helvetica,sans-serif;color:#222;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f6f5f1;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="background:#ffffff;border-radius:6px;overflow:hidden;max-width:600px;">
        <tr>
          <td style="background:${INDIGO};color:#ffffff;padding:20px 28px;font-size:18px;font-weight:bold;">
            BHF &mdash; ${escapeHtml(LEGAL_NAME)}
          </td>
        </tr>
        <tr>
          <td style="padding:28px;font-size:15px;line-height:1.55;color:#222;">
            ${bodyHtml}
          </td>
        </tr>
        <tr>
          <td style="background:#f1efe8;padding:16px 28px;font-size:12px;color:#666;border-top:3px solid ${SAFFRON};">
            ${escapeHtml(LEGAL_NAME)} &middot; Fairfield, CA
            <br>You are receiving this email because of activity on your BHF account.
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function button(href: string, label: string): string {
  return `<p style="margin:24px 0;">
    <a href="${escapeHtml(href)}"
       style="background:${SAFFRON};color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:4px;font-weight:bold;display:inline-block;">
      ${escapeHtml(label)}
    </a>
  </p>`;
}

export function welcomeEmail(memberName: string): EmailTemplate {
  const subject = `Welcome to ${LEGAL_NAME}`;
  const safeName = escapeHtml(memberName || 'there');
  const html = shell(
    subject,
    `
      <h2 style="margin:0 0 12px;color:${INDIGO};">Welcome, ${safeName}!</h2>
      <p>Thanks for joining the BHF community. Your account is ready and your email is verified.</p>
      <p>We share Bharatiya heritage through events, classes, and cultural programs.
         Watch your inbox for upcoming gatherings.</p>
      <p style="margin-top:20px;">— The BHF Team</p>
    `,
  );
  const text = [
    `Welcome, ${memberName || 'there'}!`,
    '',
    `Thanks for joining ${LEGAL_NAME}. Your account is ready and your email is verified.`,
    '',
    'We share Bharatiya heritage through events, classes, and cultural programs.',
    '',
    '— The BHF Team',
  ].join('\n');
  return { subject, html, text };
}

export function verifyEmail(
  memberName: string,
  verifyUrl: string,
): EmailTemplate {
  const subject = 'Verify your BHF account';
  const safeName = escapeHtml(memberName || 'there');
  const html = shell(
    subject,
    `
      <h2 style="margin:0 0 12px;color:${INDIGO};">Verify your email</h2>
      <p>Hi ${safeName}, welcome to ${escapeHtml(LEGAL_NAME)}!</p>
      <p>Please confirm your email address to activate your account.</p>
      ${button(verifyUrl, 'Verify my email')}
      <p style="font-size:13px;color:#555;">If the button doesn't work, copy and paste this link:<br>
        <span style="word-break:break-all;color:${INDIGO};">${escapeHtml(verifyUrl)}</span>
      </p>
      <p style="font-size:13px;color:#555;margin-top:20px;">
        If you did not create this account, you can ignore this email.
      </p>
    `,
  );
  const text = [
    `Welcome to BHF, ${memberName || 'there'}!`,
    '',
    'Please verify your email by visiting:',
    verifyUrl,
    '',
    'If you did not create this account, you can ignore this email.',
  ].join('\n');
  return { subject, html, text };
}

export function passwordResetEmail(
  memberName: string,
  resetUrl: string,
): EmailTemplate {
  const subject = 'Reset your BHF password';
  const safeName = escapeHtml(memberName || 'there');
  const html = shell(
    subject,
    `
      <h2 style="margin:0 0 12px;color:${INDIGO};">Reset your password</h2>
      <p>Hi ${safeName},</p>
      <p>We received a request to reset your BHF password.
         This link expires in <strong>1 hour</strong>.</p>
      ${button(resetUrl, 'Reset my password')}
      <p style="font-size:13px;color:#555;">If the button doesn't work, copy and paste this link:<br>
        <span style="word-break:break-all;color:${INDIGO};">${escapeHtml(resetUrl)}</span>
      </p>
      <p style="font-size:13px;color:#555;margin-top:20px;">
        If you did not request this, you can safely ignore this email — your password will not change.
      </p>
    `,
  );
  const text = [
    `Hi ${memberName || 'there'},`,
    '',
    'We received a request to reset your BHF password. This link expires in 1 hour:',
    resetUrl,
    '',
    'If you did not request this, you can safely ignore this email.',
  ].join('\n');
  return { subject, html, text };
}

function formatEventDate(startsAt: string | Date): string {
  const d = startsAt instanceof Date ? startsAt : new Date(startsAt);
  return d.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export interface RsvpEventInfo {
  title: string;
  startsAt: string | Date;
  location?: string | null;
}

export function rsvpConfirmationEmail(
  name: string,
  event: RsvpEventInfo,
  partySize: number,
): EmailTemplate {
  const subject = `You're confirmed: ${event.title}`;
  const safeName = escapeHtml(name || 'there');
  const safeTitle = escapeHtml(event.title);
  const dateStr = formatEventDate(event.startsAt);
  const locationLine = event.location
    ? `<p><strong>Where:</strong> ${escapeHtml(event.location)}</p>`
    : '';
  const html = shell(
    subject,
    `
      <h2 style="margin:0 0 12px;color:${INDIGO};">RSVP confirmed</h2>
      <p>Hi ${safeName}, thanks for RSVPing! We've saved your spot.</p>
      <p><strong>Event:</strong> ${safeTitle}</p>
      <p><strong>When:</strong> ${escapeHtml(dateStr)}</p>
      ${locationLine}
      <p><strong>Party size:</strong> ${partySize}</p>
      <p style="margin-top:20px;">If your plans change, please let us know so we can free up the spot.</p>
      <p>— The BHF Team</p>
    `,
  );
  const lines = [
    `Hi ${name || 'there'},`,
    '',
    'Your RSVP is confirmed:',
    '',
    `Event: ${event.title}`,
    `When: ${dateStr}`,
  ];
  if (event.location) lines.push(`Where: ${event.location}`);
  lines.push(`Party size: ${partySize}`);
  lines.push('', '— The BHF Team');
  return { subject, html, text: lines.join('\n') };
}

export function donationReceiptEmail(
  donorName: string,
  amount: string,
  type: string,
  receiptHtml: string,
): EmailTemplate {
  const subject = 'Your BHF donation receipt';
  const safeName = escapeHtml(donorName || 'friend');
  const safeAmount = escapeHtml(amount);
  const safeType = escapeHtml(type);
  const html = shell(
    subject,
    `
      <h2 style="margin:0 0 12px;color:${INDIGO};">Thank you for your gift</h2>
      <p>Dear ${safeName},</p>
      <p>We received your ${safeType} of <strong>${safeAmount}</strong>. Your support sustains
         BHF's cultural and educational programs.</p>
      <p>Your official receipt is included below for your tax records.</p>
      <hr style="border:none;border-top:1px solid #ddd;margin:20px 0;">
      ${receiptHtml}
    `,
  );
  const text = [
    `Dear ${donorName || 'friend'},`,
    '',
    `Thank you for your ${type} of ${amount}. Your support sustains BHF's cultural and educational programs.`,
    '',
    'A full receipt is included with this email for your tax records.',
    '',
    '— The BHF Team',
  ].join('\n');
  return { subject, html, text };
}
