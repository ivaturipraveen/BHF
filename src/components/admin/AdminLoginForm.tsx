'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function AdminLoginForm({ next }: { next?: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [needsTotp, setNeedsTotp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          ...(needsTotp && totpCode ? { totpCode } : {}),
        }),
      });
      if (res.status === 401) {
        setError('Invalid credentials.');
        setBusy(false);
        return;
      }
      if (res.status === 429) {
        setError('Too many attempts. Please wait a minute and try again.');
        setBusy(false);
        return;
      }
      if (!res.ok) {
        setError('Sign in failed. Please try again.');
        setBusy(false);
        return;
      }
      const data = await res.json();
      if (data.needsTotp) {
        setNeedsTotp(true);
        setBusy(false);
        return;
      }
      window.location.assign(next || '/admin');
    } catch {
      setError('Sign in failed. Please try again.');
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="username"
        disabled={needsTotp}
      />
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="current-password"
        disabled={needsTotp}
      />
      {needsTotp && (
        <Input
          label="6-digit authentication code"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={totpCode}
          onChange={(e) => setTotpCode(e.target.value)}
          required
          autoFocus
          maxLength={10}
          hint="Open your authenticator app and enter the current code."
        />
      )}
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <Button type="submit" disabled={busy} className="w-full">
        {busy ? 'Signing in…' : needsTotp ? 'Verify code' : 'Sign in'}
      </Button>
    </form>
  );
}
