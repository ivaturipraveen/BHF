// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import {
  BASE,
  adminFetch,
  adminLogin,
  ensureServerReachable,
  uniqueTestIp,
  type AdminCtx,
} from './_helpers';

let ctx: AdminCtx;
const createdUrls: string[] = [];

function jpegBuffer(size: number = 256): Buffer {
  // ff d8 ff e0 ... ff d9
  const buf = Buffer.alloc(size);
  buf[0] = 0xff;
  buf[1] = 0xd8;
  buf[2] = 0xff;
  buf[3] = 0xe0;
  buf[size - 2] = 0xff;
  buf[size - 1] = 0xd9;
  return buf;
}

function pngBuffer(): Buffer {
  // 89 50 4e 47 0d 0a 1a 0a + 1x1 IHDR-ish padding
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    Buffer.alloc(64),
  ]);
}

function pdfBuffer(): Buffer {
  return Buffer.from('%PDF-1.4\n%\xc3\xa1\xc3\xa9\n1 0 obj\n<<>>endobj\n%%EOF\n');
}

async function unlinkIfExists(absPath: string): Promise<void> {
  try {
    await fs.unlink(absPath);
  } catch {
    // ignore
  }
}

beforeAll(async () => {
  await ensureServerReachable();
  ctx = await adminLogin();
});

afterAll(async () => {
  for (const url of createdUrls) {
    // url format: /uploads/YYYY/MM/<name>.<ext>
    const abs = path.join(process.cwd(), 'public', url);
    await unlinkIfExists(abs);
  }
});

async function uploadFile(
  buffer: Buffer,
  filename: string,
  mime: string,
  options: { withCtx?: boolean; withCsrf?: boolean } = {},
): Promise<Response> {
  const withCtx = options.withCtx ?? true;
  const withCsrf = options.withCsrf ?? true;

  const fd = new FormData();
  const blob = new Blob([buffer], { type: mime });
  fd.append('file', blob, filename);

  if (!withCtx) {
    return fetch(`${BASE}/api/admin/uploads`, {
      method: 'POST',
      body: fd,
      headers: { 'x-forwarded-for': uniqueTestIp() },
      redirect: 'manual',
    });
  }

  return adminFetch(
    '/api/admin/uploads',
    { method: 'POST', body: fd, skipCsrf: !withCsrf },
    ctx,
  );
}

describe('POST /api/admin/uploads', () => {
  it('accepts a valid jpeg → 201, file written under /public/uploads/', async () => {
    const res = await uploadFile(jpegBuffer(512), 'qa.jpg', 'image/jpeg');
    expect(res.status).toBe(201);
    const json = (await res.json()) as { url: string; bytes: number; mimeType: string };
    expect(json.url.startsWith('/uploads/')).toBe(true);
    expect(json.mimeType).toBe('image/jpeg');
    createdUrls.push(json.url);
    // file is on disk
    const abs = path.join(process.cwd(), 'public', json.url);
    const stat = await fs.stat(abs);
    expect(stat.isFile()).toBe(true);
    expect(stat.size).toBe(512);
  });

  it('accepts a valid png → 201', async () => {
    const res = await uploadFile(pngBuffer(), 'qa.png', 'image/png');
    expect(res.status).toBe(201);
    const json = (await res.json()) as { url: string; mimeType: string };
    expect(json.url.startsWith('/uploads/')).toBe(true);
    expect(json.mimeType).toBe('image/png');
    createdUrls.push(json.url);
  });

  it('accepts a valid pdf → 201', async () => {
    const res = await uploadFile(pdfBuffer(), 'qa.pdf', 'application/pdf');
    expect(res.status).toBe(201);
    const json = (await res.json()) as { url: string; mimeType: string };
    expect(json.mimeType).toBe('application/pdf');
    createdUrls.push(json.url);
  });

  it('rejects an svg with 400', async () => {
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>');
    const res = await uploadFile(svg, 'evil.svg', 'image/svg+xml');
    expect(res.status).toBe(400);
    const json = (await res.json()) as { error?: string };
    expect(json.error ?? '').toMatch(/svg/i);
  });

  it('rejects a text file disguised as image/jpeg (wrong magic bytes) with 400', async () => {
    const text = Buffer.from('this is plainly not a jpeg, friend.\n');
    const res = await uploadFile(text, 'evil.jpg', 'image/jpeg');
    expect(res.status).toBe(400);
    const json = (await res.json()) as { error?: string };
    expect(json.error ?? '').toMatch(/content does not match/i);
  });

  it('rejects file > 10MB with 413', async () => {
    // 10 * 1024 * 1024 + 1 byte over the limit. Use valid jpeg header
    // so we hit the size guard, not the magic-byte guard.
    const size = 10 * 1024 * 1024 + 1024;
    const buf = jpegBuffer(size);
    const res = await uploadFile(buf, 'big.jpg', 'image/jpeg');
    expect(res.status).toBe(413);
  });

  it('returns 401 without an admin cookie', async () => {
    const res = await uploadFile(jpegBuffer(), 'qa.jpg', 'image/jpeg', { withCtx: false });
    expect(res.status).toBe(401);
  });

  it('returns 403 when admin cookie is present but CSRF header is missing', async () => {
    const res = await uploadFile(jpegBuffer(), 'qa.jpg', 'image/jpeg', { withCsrf: false });
    expect(res.status).toBe(403);
  });
});
