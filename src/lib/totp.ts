import 'server-only';
import { generateSecret, generateURI, verifySync } from 'otplib';
import QRCode from 'qrcode';

const ISSUER = 'BHF';

export interface TotpSecret {
  secret: string;
  otpauthUrl: string;
}

export function generateTotpSecret(adminEmail: string): TotpSecret {
  const secret = generateSecret();
  const otpauthUrl = generateURI({ issuer: ISSUER, label: adminEmail, secret });
  return { secret, otpauthUrl };
}

export function verifyTotpCode(secret: string, code: string): boolean {
  if (!secret || !code) return false;
  const cleaned = code.replace(/\s+/g, '');
  if (!/^\d{6,8}$/.test(cleaned)) return false;
  try {
    const result = verifySync({
      token: cleaned,
      secret,
      strategy: 'totp',
      epochTolerance: 1,
    });
    return result.valid === true;
  } catch {
    return false;
  }
}

export async function generateQrCodeDataUrl(otpauthUrl: string): Promise<string> {
  return QRCode.toDataURL(otpauthUrl, { width: 240, margin: 1 });
}
