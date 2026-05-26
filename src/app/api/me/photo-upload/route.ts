import { NextResponse, type NextRequest } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { requireMemberSessionOrJson } from '@/lib/session';
import { updateMemberPhoto } from '@/lib/queries/account';
import { reportError } from '@/lib/sentry';

export const dynamic = 'force-dynamic';

const MAX_BYTES = 5 * 1024 * 1024;

const ALLOWED_MIME: ReadonlyMap<string, string> = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/avif', 'avif'],
]);

function detectMagicMime(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
    buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
  ) return 'image/png';
  if (
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  ) return 'image/webp';
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

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req.headers);
  const limited = rateLimit(ip, 'me-photo-upload', 5, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again in a minute.' },
      { status: 429 },
    );
  }

  const guard = await requireMemberSessionOrJson();
  if (!guard.ok) return guard.response;

  const memberId = guard.session.sub;
  if (!UUID_RE.test(memberId)) {
    return NextResponse.json({ error: 'Invalid session.' }, { status: 400 });
  }

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
    return NextResponse.json({ error: 'File too large (max 5MB).' }, { status: 413 });
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
      { error: 'Unsupported file type. Allowed: jpeg, png, webp, avif.' },
      { status: 415 },
    );
  }

  const buffer = Buffer.from(await f.arrayBuffer());
  if (buffer.length > MAX_BYTES) {
    return NextResponse.json({ error: 'File too large (max 5MB).' }, { status: 413 });
  }

  const detected = detectMagicMime(buffer);
  if (!detected || detected !== declaredMime) {
    return NextResponse.json(
      { error: 'File content does not match declared type.' },
      { status: 400 },
    );
  }

  const ext = ALLOWED_MIME.get(declaredMime) ?? 'bin';
  const random = randomBytes(16).toString('base64url');
  const originalName = sanitizeFilename(f.name || `avatar.${ext}`);
  const finalName = `${random}-${originalName}`;
  const ensuredName = finalName.toLowerCase().endsWith(`.${ext}`)
    ? finalName
    : `${finalName}.${ext}`;

  const dir = path.join(process.cwd(), 'public', 'uploads', 'members', memberId);
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, ensuredName);
  await fs.writeFile(filePath, buffer);

  const url = `/uploads/members/${memberId}/${ensuredName}`;
  try {
    await updateMemberPhoto(memberId, url);
  } catch (err) {
    reportError(err, { route: 'me/photo-upload' });
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
  return NextResponse.json(
    { url, bytes: buffer.length, mimeType: declaredMime },
    { status: 201 },
  );
}
