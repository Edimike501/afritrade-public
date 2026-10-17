/**
 * Hashes a plaintext password using SHA-256 at the client/hook level.
 * This ensures plaintext passwords are never transmitted over the network
 * or held unnecessarily in browser memory.
 *
 * Compatible with modern Web Crypto API (browsers) and Node.js (SSR / Jest).
 */
export async function hashPassword(password: string): Promise<string> {
  const subtle = typeof globalThis !== "undefined" ? globalThis.crypto?.subtle : undefined;
  if (subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  // Node.js fallback (environments without globalThis.crypto)
  try {
    const req = typeof module !== "undefined" ? eval("require") : undefined;
    if (req) {
      const nodeCrypto = req("crypto");
      return nodeCrypto.createHash("sha256").update(password).digest("hex");
    }
  } catch {
    // ignore
  }

  throw new Error("No cryptographic implementation available for password hashing");
}
