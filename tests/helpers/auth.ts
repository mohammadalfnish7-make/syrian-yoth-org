import { signToken } from "@/lib/auth";
import type { JwtPayload } from "@/lib/rbac";
import { cookieStore, mockPrisma } from "../setup.api";

const COOKIE_NAME = "yaf_token";

export async function setAuthSession(payload: JwtPayload) {
  mockPrisma.admin.findUnique.mockResolvedValue({
    isActive: true,
    role: payload.role,
    governorateId: payload.governorateId,
  });

  const token = await signToken(payload);
  cookieStore.set(COOKIE_NAME, token);
}

export const superAdminSession: JwtPayload = {
  sub: "admin-1",
  username: "admin",
  role: "SUPER_ADMIN",
  governorateId: null,
};

export const governorateAdminSession: JwtPayload = {
  sub: "gov-admin-1",
  username: "govadmin",
  role: "GOVERNORATE_ADMIN",
  governorateId: "gov-1",
};

export const VALID_UPLOAD_FILENAME = "550e8400-e29b-41d4-a716-446655440000.webp";
