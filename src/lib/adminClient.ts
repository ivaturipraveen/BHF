'use client';

let cachedCsrf: string | null = null;

async function fetchCsrf(): Promise<string> {
  const res = await fetch('/api/admin/auth/csrf', {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });
  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      const next = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.assign(`/admin/login?next=${next}`);
    }
    throw new Error('Authentication required.');
  }
  if (!res.ok) {
    throw new Error('Could not obtain CSRF token.');
  }
  const data = await res.json();
  return data.csrfToken as string;
}

export async function getCsrfToken(forceRefresh = false): Promise<string> {
  if (!forceRefresh && cachedCsrf) return cachedCsrf;
  const t = await fetchCsrf();
  cachedCsrf = t;
  return t;
}

export interface AdminFetchInit extends Omit<RequestInit, 'body'> {
  json?: unknown;
  body?: BodyInit | null;
}

function isCsrfError(bodyText: string): boolean {
  return bodyText.toLowerCase().includes('csrf');
}

export async function adminFetch(path: string, init: AdminFetchInit = {}): Promise<Response> {
  const method = (init.method ?? 'GET').toUpperCase();
  const isMutation = method !== 'GET' && method !== 'HEAD';

  const headers = new Headers(init.headers ?? {});
  let body: BodyInit | null | undefined = init.body;
  if (init.json !== undefined) {
    headers.set('content-type', 'application/json');
    body = JSON.stringify(init.json);
  }

  if (isMutation) {
    const token = await getCsrfToken();
    headers.set('x-csrf-token', token);
  }

  const doFetch = async (): Promise<Response> =>
    fetch(path, {
      ...init,
      method,
      headers,
      body,
      credentials: 'include',
      cache: 'no-store',
    });

  let res = await doFetch();

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      const next = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.assign(`/admin/login?next=${next}`);
    }
    return res;
  }

  if (res.status === 403 && isMutation) {
    const clone = res.clone();
    let bodyText = '';
    try { bodyText = await clone.text(); } catch { /* ignore */ }
    if (isCsrfError(bodyText)) {
      const refreshed = await getCsrfToken(true);
      headers.set('x-csrf-token', refreshed);
      res = await doFetch();
    }
  }

  return res;
}

export async function uploadFile(file: File): Promise<{ url: string; bytes: number; mimeType: string }> {
  const form = new FormData();
  form.append('file', file);
  const token = await getCsrfToken();
  let res = await fetch('/api/admin/uploads', {
    method: 'POST',
    credentials: 'include',
    cache: 'no-store',
    headers: { 'x-csrf-token': token },
    body: form,
  });
  if (res.status === 403) {
    const fresh = await getCsrfToken(true);
    res = await fetch('/api/admin/uploads', {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
      headers: { 'x-csrf-token': fresh },
      body: form,
    });
  }
  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      window.location.assign('/admin/login');
    }
    throw new Error('Authentication required.');
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Upload failed (${res.status}).`);
  }
  const data = await res.json();
  if (typeof window !== 'undefined' && typeof data.url === 'string' && data.url.startsWith('/')) {
    data.url = new URL(data.url, window.location.origin).toString();
  }
  return data;
}
