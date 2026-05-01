const ITERATIONS = 100_000;
const KEY_LEN = 32;

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string): ArrayBuffer {
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) arr[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  return arr.buffer as ArrayBuffer;
}

// Constant-time string comparison — prevents timing-oracle attacks on hash output.
// Uses XOR accumulation so every character is always compared regardless of position.
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function derive(password: string, salt: ArrayBuffer): Promise<ArrayBuffer> {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]
  );
  return crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" },
    key, KEY_LEN * 8
  );
}

export async function hashPassword(password: string): Promise<string> {
  const saltBuf = crypto.getRandomValues(new Uint8Array(16)).buffer as ArrayBuffer;
  const hash = await derive(password, saltBuf);
  return `pbkdf2:${toHex(saltBuf)}:${toHex(hash)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (!stored.startsWith("pbkdf2:")) return false;
  const [, saltHex, expectedHex] = stored.split(":");
  const hash = await derive(password, fromHex(saltHex));
  return timingSafeEqual(toHex(hash), expectedHex);
}
