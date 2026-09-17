import { AdminRole } from "@prisma/client";

export type JwtPayload = {
  sub: string;
  username: string;
  role: AdminRole;
  governorateId: string | null;
};

export type Permission =
  | "manage_site_settings"
  | "manage_admins"
  | "manage_stats"
  | "manage_news"
  | "manage_programs"
  | "manage_focus_areas"
  | "manage_partners"
  | "manage_board_members"
  | "view_requests";

const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  SUPER_ADMIN: [
    "manage_site_settings",
    "manage_admins",
    "manage_stats",
    "manage_news",
    "manage_programs",
    "manage_focus_areas",
    "manage_partners",
    "manage_board_members",
    "view_requests",
  ],
  GOVERNORATE_ADMIN: ["manage_news", "view_requests"],
};

export function hasPermission(role: AdminRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function canAccessGovernorate(
  payload: JwtPayload,
  governorateId: string
): boolean {
  if (payload.role === "SUPER_ADMIN") return true;
  return payload.governorateId === governorateId;
}

export function getUploadCategoryPermission(
  category: import("@/lib/upload").UploadCategory
): Permission {
  const map: Record<import("@/lib/upload").UploadCategory, Permission> = {
    news: "manage_news",
    partners: "manage_partners",
    programs: "manage_programs",
    "focus-areas": "manage_focus_areas",
    site: "manage_site_settings",
    logos: "manage_site_settings",
    managers: "manage_board_members",
  };
  return map[category];
}
