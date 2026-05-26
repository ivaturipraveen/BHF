// Tradeoff: the members table stores email_verification_token and password_reset_token
// as raw text rather than a SHA-256 hash. Storing only hashes would limit DB-read exposure
// (an attacker with a SQL dump could not directly use the tokens), but it requires a
// schema change. For Phase 4 we accept the tradeoff and mitigate it by making tokens:
//   - Long (32 random bytes, base64url-encoded)
//   - Single-use (cleared on consumption)
//   - Time-limited (password resets expire in 1 hour; verify tokens cleared after first use)
// Phase 7 may revisit by switching to hashed-only storage.
import 'server-only';
import { randomBytes, createHash } from 'crypto';

export function generateOpaqueToken(bytes: number = 32): string {
  return randomBytes(bytes).toString('base64url');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
