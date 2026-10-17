import { hashPassword } from "./crypto";

describe("hashPassword", () => {
  it("hashes password with SHA-256 into a 64-character hex string", async () => {
    const raw = "SecurePassword123!";
    const hashed = await hashPassword(raw);

    expect(typeof hashed).toBe("string");
    expect(hashed).toHaveLength(64);
    // Check that it's valid hex
    expect(/^[a-f0-9]{64}$/.test(hashed)).toBe(true);

    // Deterministic: same input produces same hash
    const hashedAgain = await hashPassword(raw);
    expect(hashedAgain).toBe(hashed);
  });

  it("produces distinct hashes for different passwords", async () => {
    const hash1 = await hashPassword("PasswordOne");
    const hash2 = await hashPassword("PasswordTwo");

    expect(hash1).not.toBe(hash2);
  });
});
