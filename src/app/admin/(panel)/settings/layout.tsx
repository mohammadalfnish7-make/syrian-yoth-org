import { redirect } from "next/navigation";
import { getVerifiedSession } from "@/lib/auth";

export default async function AdminSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getVerifiedSession();

  if (!session) {
    redirect("/admin/login");
  }

  if (session.role !== "SUPER_ADMIN") {
    redirect("/admin/dashboard");
  }

  return children;
}
