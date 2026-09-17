const DEV_ONLY_SECRET = "dev-only-not-for-production-use-32chars";

export function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET must be set and at least 32 characters in production");
    }
    return new TextEncoder().encode(DEV_ONLY_SECRET);
  }

  return new TextEncoder().encode(secret);
}
