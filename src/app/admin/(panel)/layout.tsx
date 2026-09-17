import { redirect } from "next/navigation";
import { getVerifiedSession } from "@/lib/auth";
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

  return (
    <AdminShell
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
