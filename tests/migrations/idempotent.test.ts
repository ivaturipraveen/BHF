// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';

describe('migrations: idempotent re-run', () => {
  it('npm run db:migrate applies zero new migrations on second run', () => {
    const out = execSync('npm run db:migrate --silent', {
      cwd: '/home/ubuntu/app',
      env: { ...process.env },
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 60_000,
    });

    const match = out.match(/\[migrate\] up applied:\s*(\[[^\]]*\])/);
    expect(match, `Expected "[migrate] up applied: [...]" in output:\n${out}`).not.toBeNull();
    const appliedArray = match![1].trim();
    // On idempotent re-run, the applied list should be empty (`[]`).
    expect(appliedArray).toBe('[]');
  }, 90_000);
});
