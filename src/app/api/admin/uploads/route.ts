import { NextResponse, type NextRequest } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';
import { adminGuard } from '@/lib/adminGuard';

export const dynamic = 'force-dynamic';

// TODO: Phase 7 — move to S3 / Cloudinary. The Next.js serverless runtime does not
// have a writable /public/uploads directory; local filesystem storage works only
// when the app is hosted on a long-lived server with a persistent disk.

const MAX_BYTES = 10 * 1024 * 1024;

const ALLOWED_MIME: ReadonlyMap<string, string> = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/avif', 'avif'],
  ['application/pdf', 'pdf'],
]);

function detectMagicMime(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  // JPEG: ff d8 ff
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  // PNG: 89 50 4e 47 0d 0a 1a 0a
  if (
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
    buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
  ) return 'image/png';
  // PDF: %PDF
  if (buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46) {
    return 'application/pdf';
  }
  // WebP: RIFF....WEBP
  if (
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  ) return 'image/webp';
  // AVIF: ISO-BMFF ftyp box with avif/avis brand at bytes 8..11
  if (
    buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70 &&
    ((buf[8] === 0x61 && buf[9] === 0x76 && buf[10] === 0x69 && (buf[11] === 0x66 || buf[11] === 0x73)) ||
     (buf[8] === 0x6d && buf[9] === 0x69 && buf[10] === 0x66 && buf[11] === 0x31))
  ) return 'image/avif';
  return null;
}

function sanitizeFilename(name: string): string {
  const base = name.replace(/[\\/]/g, '_').slice(-128);
  const cleaned = base.replace(/[^A-Za-z0-9._-]/g, '-');
  return cleaned.slice(0, 64) || 'file';
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const guard = await adminGuard(req, { rateLimitMax: 20 });
  if (!guard.ok) return guard.response;

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid multipart form.' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'Missing "file" field.' }, { status: 400 });
  }
  if (typeof (file as Blob).arrayBuffer !== 'function') {
    return NextResponse.json({ error: 'Invalid file upload.' }, { status: 400 });
  }
  const f = file as File;

  if (f.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File too large (max 10MB).' }, { status: 413 });
  }
  if (f.size <= 0) {
    return NextResponse.json({ error: 'Empty file.' }, { status: 400 });
  }

  const declaredMime = (f.type || '').toLowerCase();
  if (declaredMime === 'image/svg+xml' || declaredMime.includes('svg')) {
    return NextResponse.json({ error: 'SVG uploads are not allowed.' }, { status: 400 });
  }
  if (!ALLOWED_MIME.has(declaredMime)) {
    return NextResponse.json(
      { error: 'Unsupported file type. Allowed: jpeg, png, webp, avif, pdf.' },
      { status: 415 },
    );
  }

  const buffer = Buffer.from(await f.arrayBuffer());
  if (buffer.length > MAX_BYTES) {
    return NextResponse.json({ error: 'File too large (max 10MB).' }, { status: 413 });
  }

  const detected = detectMagicMime(buffer);
  if (!detected || detected !== declaredMime) {
    return NextResponse.json(
      { error: 'File content does not match declared type.' },
      { status: 400 },
    );
  }

  const ext = ALLOWED_MIME.get(declaredMime) ?? 'bin';
  const now = new Date();
  const yyyy = String(now.getUTCFullYear());
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const random = randomBytes(16).toString('base64url');
  const originalName = sanitizeFilename(f.name || `upload.${ext}`);
  const finalName = `${random}-${originalName}`;
  const ensuredName = finalName.toLowerCase().endsWith(`.${ext}`)
    ? finalName
    : `${finalName}.${ext}`;

  const dir = path.join(process.cwd(), 'public', 'uploads', yyyy, mm);
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, ensuredName);
  await fs.writeFile(filePath, buffer);

  const url = `/uploads/${yyyy}/${mm}/${ensuredName}`;
  return NextResponse.json(
    { url, bytes: buffer.length, mimeType: declaredMime },
    { status: 201 },
  );
}
