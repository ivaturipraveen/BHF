import 'server-only';
import {
  EIN,
  LEGAL_NAME,
  LEGAL_ADDRESS,
  DONATION_CONTACT_PHONE,
} from '@/lib/config/donations';

export interface BuildReceiptInput {
  donorName: string;
  amountCents: number;
  type: 'one_time' | 'monthly' | 'yearly';
  dateIso: string;
  donationId: string;
  address?: string | null;
  inHonorOf?: string | null;
}

function formatAmount(cents: number): string {
  const dollars = cents / 100;
  return dollars.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
}

function formatType(type: BuildReceiptInput['type']): string {
  if (type === 'one_time') return 'One-time donation';
  if (type === 'monthly') return 'Monthly recurring donation';
  return 'Yearly recurring donation';
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function buildReceiptText(input: BuildReceiptInput): string {
  const lines: string[] = [];
  lines.push(`${LEGAL_NAME}`);
  lines.push(`EIN: ${EIN}`);
  lines.push(`${LEGAL_ADDRESS}`);
  lines.push(`Phone: ${DONATION_CONTACT_PHONE}`);
  lines.push('');
  lines.push('OFFICIAL DONATION RECEIPT');
  lines.push('');
  lines.push(`Receipt ID: ${input.donationId}`);
  lines.push(`Date: ${formatDate(input.dateIso)}`);
  lines.push(`Donor: ${input.donorName}`);
  if (input.address) {
    lines.push(`Address: ${input.address}`);
  }
  lines.push(`Amount: ${formatAmount(input.amountCents)}`);
  lines.push(`Type: ${formatType(input.type)}`);
  if (input.inHonorOf) {
    lines.push(`In honor of: ${input.inHonorOf}`);
  }
  lines.push('');
  lines.push(
    'No goods or services were provided in exchange for this contribution.',
  );
  lines.push('');
  lines.push(
    `${LEGAL_NAME} is a registered 501(c)(3) tax-exempt organization. ` +
      'Please retain this receipt for your records.',
  );
  return lines.join('\n');
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildReceiptHtml(input: BuildReceiptInput): string {
  const honor = input.inHonorOf
    ? `<p><strong>In honor of:</strong> ${escapeHtml(input.inHonorOf)}</p>`
    : '';
  const address = input.address
    ? `<p><strong>Address:</strong> ${escapeHtml(input.address)}</p>`
    : '';
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Donation Receipt — ${escapeHtml(LEGAL_NAME)}</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 640px; margin: 24px auto; color: #222;">
  <header style="border-bottom: 2px solid #ddd; padding-bottom: 12px; margin-bottom: 16px;">
    <h1 style="margin: 0;">${escapeHtml(LEGAL_NAME)}</h1>
    <div style="color: #555; font-size: 14px;">
      EIN: ${escapeHtml(EIN)}<br>
      ${escapeHtml(LEGAL_ADDRESS)}<br>
      Phone: ${escapeHtml(DONATION_CONTACT_PHONE)}
    </div>
  </header>
  <h2 style="margin-top: 0;">Official Donation Receipt</h2>
  <p><strong>Receipt ID:</strong> ${escapeHtml(input.donationId)}</p>
  <p><strong>Date:</strong> ${escapeHtml(formatDate(input.dateIso))}</p>
  <p><strong>Donor:</strong> ${escapeHtml(input.donorName)}</p>
  ${address}
  <p><strong>Amount:</strong> ${escapeHtml(formatAmount(input.amountCents))}</p>
  <p><strong>Type:</strong> ${escapeHtml(formatType(input.type))}</p>
  ${honor}
  <p style="margin-top: 16px; padding: 12px; background: #f6f6f6; border-radius: 4px;">
    <em>No goods or services were provided in exchange for this contribution.</em>
  </p>
  <p style="font-size: 13px; color: #555;">
    ${escapeHtml(LEGAL_NAME)} is a registered 501(c)(3) tax-exempt organization.
    Please retain this receipt for your records.
  </p>
</body>
</html>`;
}
