import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getJwtSecret } from "@/lib/jwt-secret";
import { prisma } from "@/lib/prisma";
import type { JwtPayload } from "./rbac";

const COOKIE_NAME = "yaf_token";
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

function parseExpirySeconds(expiry: string): number {
  const map: Record<string, number> = {
    d: 86400,
    h: 3600,
    m: 60,
    s: 1,
  };
  const match = expiry.match(/^(\d+)([dhms])$/);
  if (!match) return 7 * 86400;
  return parseInt(match[1], 10) * map[match[2]];
}

function parseExpiry(expiry: string): string {
  return `${parseExpirySeconds(expiry)}s`;
}

export function getCookieMaxAge(): number {
  return parseExpirySeconds(EXPIRES_IN);
}

export async function signToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(parseExpiry(EXPIRES_IN))
    .sign(getJwtSecret());
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getVerifiedSession(): Promise<JwtPayload | null> {
  const session = await getSession();
  if (!session) return null;

  const admin = await prisma.admin.findUnique({
    where: { id: session.sub },
    select: { isActive: true, role: true, governorateId: true },
  });

  if (!admin?.isActive) return null;

  return {
    ...session,
    role: admin.role,
    governorateId: admin.governorateId,
  };
}

export function getTokenCookieOptions(token: string) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: getCookieMaxAge(),
  };
}

export function getClearCookieOptions() {
  return {
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}
