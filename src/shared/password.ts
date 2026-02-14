import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const HASH_PREFIX = "scrypt";
const KEY_LENGTH = 64;

type ParsedHash = {
  n: number;
  r: number;
  p: number;
  salt: Buffer;
  hash: Buffer;
};

export type PasswordVerificationResult = {
  valid: boolean;
  needsRehash: boolean;
};

export function hashPassword(password: string): string {
  const n = 16384;
  const r = 8;
  const p = 1;
  const salt = randomBytes(16);
  const derivedKey = scryptSync(password, salt, KEY_LENGTH, { N: n, r, p });

  return [
    HASH_PREFIX,
    String(n),
    String(r),
    String(p),
    salt.toString("base64"),
    derivedKey.toString("base64")
  ].join("$");
}

export function verifyPassword(stored: string, input: string): PasswordVerificationResult {
  const parsed = parseHash(stored);
  if (!parsed) {
    return {
      valid: stored === input,
      needsRehash: true
    };
  }

  const derivedKey = scryptSync(input, parsed.salt, parsed.hash.length, {
    N: parsed.n,
    r: parsed.r,
    p: parsed.p
  });

  return {
    valid: timingSafeEqual(parsed.hash, derivedKey),
    needsRehash: false
  };
}

function parseHash(value: string): ParsedHash | null {
  const parts = value.split("$");
  if (parts.length !== 6 || parts[0] !== HASH_PREFIX) {
    return null;
  }

  const n = Number(parts[1]);
  const r = Number(parts[2]);
  const p = Number(parts[3]);
  const salt = safeBase64ToBuffer(parts[4]);
  const hash = safeBase64ToBuffer(parts[5]);

  if (!Number.isInteger(n) || !Number.isInteger(r) || !Number.isInteger(p) || !salt || !hash) {
    return null;
  }

  return { n, r, p, salt, hash };
}

function safeBase64ToBuffer(value: string): Buffer | null {
  try {
    const buffer = Buffer.from(value, "base64");
    return buffer.length > 0 ? buffer : null;
  } catch {
    return null;
  }
}

