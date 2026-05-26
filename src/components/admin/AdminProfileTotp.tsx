'use client';

import { useState } from 'react';
import { adminFetch } from '@/lib/adminClient';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface SetupData {
  otpauthUrl: string;
  qrCodeDataUrl: string;
}

export function AdminProfileTotp({ initialEnabled }: { initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [code, setCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function startSetup() {
    setError(null);
    setBusy(true);
    try {
      const res = await adminFetch('/api/admin/auth/totp/setup', { method: 'POST' });
      if (!res.ok) {
        setError('Could not start 2FA setup.');
        setBusy(false);
        return;
      }
      const data = await res.json();
      setSetupData(data);
    } catch {
      setError('Could not start 2FA setup.');
    }
    setBusy(false);
  }

  async function confirmSetup() {
    setError(null);
    setBusy(true);
    try {
      const res = await adminFetch('/api/admin/auth/totp/enable', {
        method: 'POST',
        json: { code },
      });
      if (!res.ok) {
        setError('Invalid code. Please try again.');
        setBusy(false);
        return;
      }
      setEnabled(true);
      setSetupData(null);
      setCode('');
    } catch {
      setError('Could not enable 2FA.');
    }
    setBusy(false);
  }

  async function disable2fa() {
    setError(null);
    if (!disableCode) {
      setError('Enter your current 6-digit code to disable 2FA.');
      return;
    }
    setBusy(true);
    try {
      const res = await adminFetch('/api/admin/auth/totp/disable', {
        method: 'POST',
        json: { code: disableCode },
      });
      if (!res.ok) {
        setError('Invalid code or unable to disable.');
        setBusy(false);
        return;
      }
      setEnabled(false);
      setDisableCode('');
    } catch {
      setError('Could not disable 2FA.');
    }
    setBusy(false);
  }

  if (enabled) {
    return (
      <Card>
        <h2 className="font-display text-xl text-indigo mb-2">Two-factor authentication</h2>
        <p className="text-sm text-warm-gray mb-4">
          2FA is currently <span className="text-green-700 font-medium">enabled</span> on your account.
        </p>
        <div className="space-y-3 max-w-sm">
          <Input
            label="Authenticator code"
            value={disableCode}
            onChange={(e) => setDisableCode(e.target.value)}
            inputMode="numeric"
            maxLength={10}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="button" onClick={disable2fa} disabled={busy} variant="secondary">
            {busy ? 'Disabling…' : 'Disable 2FA'}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="font-display text-xl text-indigo mb-2">Set up 2FA</h2>
      <p className="text-sm text-warm-gray mb-4">
        Add an authenticator app (Google Authenticator, 1Password, Authy) for an extra layer of protection.
      </p>
      {!setupData ? (
        <Button type="button" onClick={startSetup} disabled={busy}>
          {busy ? 'Generating…' : 'Generate QR code'}
        </Button>
      ) : (
        <div className="space-y-4 max-w-sm">
          <div className="flex items-center justify-center bg-white p-4 border border-gray-200 rounded-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={setupData.qrCodeDataUrl} alt="2FA QR code" width={192} height={192} />
          </div>
          <details>
            <summary className="text-xs text-warm-gray cursor-pointer">Manual setup key</summary>
            <code className="block mt-2 break-all text-xs p-2 bg-gray-100 rounded">{setupData.otpauthUrl}</code>
          </details>
          <Input
            label="6-digit code from app"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            inputMode="numeric"
            maxLength={10}
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="button" onClick={confirmSetup} disabled={busy}>
            {busy ? 'Verifying…' : 'Enable 2FA'}
          </Button>
        </div>
      )}
    </Card>
  );
}
