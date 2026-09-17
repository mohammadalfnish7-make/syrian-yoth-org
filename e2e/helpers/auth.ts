import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-change-in-production"
);

export async function createTestAuthToken() {
  return new SignJWT({
    sub: "admin-1",
    username: "admin",
    role: "SUPER_ADMIN",
    governorateId: null,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}
