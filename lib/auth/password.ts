/**
 * Password hashing with PBKDF2-SHA256 via WebCrypto.
 *
 * WebCrypto rather than bcrypt or `node:crypto`: it is native on Cloudflare
 * Workers with no polyfill and no native binary, and the same code runs
 * unchanged in local development.
 *
 * Format: `pbkdf2$<iterations>$<salt-b64>$<hash-b64>`. The iteration count is
 * stored per hash, so it can be raised later without invalidating existing
 * passwords — `needsRehash` reports which stored hashes are behind.
 */

const ALGORITHM = "pbkdf2";
const HASH = "SHA-256";
const SALT_BYTES = 16;
const KEY_BITS = 256;

/**
 * Workers bills CPU time per request and PBKDF2 is deliberately CPU-bound.
 * 100,000 iterations takes roughly 50ms, which keeps sign-in inside the Workers
 * CPU budget while staying well above a trivially brute-forceable count. Raise
 * this if the deployment has CPU headroom; existing hashes keep working and are
 * upgraded on next sign-in.
 */
const ITERATIONS = 100_000;

const encoder = new TextEncoder();

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function derive(password: string, salt: Uint8Array, iterations: number) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      // BufferSource typings differ between lib.dom and the Workers types.
      salt: salt as unknown as BufferSource,
      iterations,
      hash: HASH,
    },
    key,
    KEY_BITS,
  );

  return new Uint8Array(bits);
}

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await derive(password, salt, ITERATIONS);
  return `${ALGORITHM}$${ITERATIONS}$${toBase64(salt)}$${toBase64(hash)}`;
}

/** Constant-time comparison — an early return on mismatch leaks hash prefixes. */
function timingSafeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) diff |= a[index] ^ b[index];
  return diff === 0;
}

export async function verifyPassword(password: string, stored: string) {
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== ALGORITHM) return false;

  const iterations = Number.parseInt(parts[1], 10);
  if (!Number.isSafeInteger(iterations) || iterations < 1) return false;

  try {
    const salt = fromBase64(parts[2]);
    const expected = fromBase64(parts[3]);
    const actual = await derive(password, salt, iterations);
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

/** True when a stored hash predates the current iteration count. */
export function needsRehash(stored: string) {
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== ALGORITHM) return true;
  const iterations = Number.parseInt(parts[1], 10);
  return !Number.isSafeInteger(iterations) || iterations < ITERATIONS;
}

export function generateToken(bytes = 32) {
  const random = crypto.getRandomValues(new Uint8Array(bytes));
  return Array.from(random)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/** SHA-256 hex — session tokens are stored hashed, never in plaintext. */
export async function hashToken(token: string) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(token));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function passwordProblem(password: string) {
  if (password.length < 12) return "Use at least 12 characters.";
  if (!/[a-z]/.test(password)) return "Include a lowercase letter.";
  if (!/[A-Z]/.test(password)) return "Include an uppercase letter.";
  if (!/[0-9]/.test(password)) return "Include a number.";
  return null;
}
