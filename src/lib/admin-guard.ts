import { redirect } from "next/navigation";
import { getVerifiedSession } from "@/lib/auth";
import type { Permission } from "@/lib/rbac";
import { hasPermission } from "@/lib/rbac";

export function createAdminGuard(permission?: Permission, superAdminOnly = false) {
  return async function AdminGuardLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    const session = await getVerifiedSession();
    if (!session) redirect("/admin/login");

    if (superAdminOnly && session.role !== "SUPER_ADMIN") {
      redirect("/admin/dashboard");
    }

    if (permission && !hasPermission(session.role, permission)) {
      redirect("/admin/dashboard");
    }

    return children;
  };
}
