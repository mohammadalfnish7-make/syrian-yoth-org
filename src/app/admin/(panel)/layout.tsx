import { redirect } from "next/navigation";
import { getVerifiedSession } from "@/lib/auth";
import { getPublicSettings } from "@/lib/settings";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getVerifiedSession();
  if (!session) {
    redirect("/admin/login");
  }

  const settings = await getPublicSettings();

  return (
    <AdminShell
      orgName={{ ar: settings.branding.nameAr, en: settings.branding.nameEn }}
      session={{
        username: session.username,
        role: session.role,
        governorateId: session.governorateId,
      }}
    >
      {children}
    </AdminShell>
  );
}
