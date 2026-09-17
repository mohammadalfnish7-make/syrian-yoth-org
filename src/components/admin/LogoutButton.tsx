"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

type LogoutButtonProps = {
  variant?: "default" | "icon";
};

export function LogoutButton({ variant = "default" }: LogoutButtonProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleLogout}
        className="admin-shell__logout-icon"
        title="Logout"
        aria-label="Logout"
      >
        <LogOut size={18} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="admin-btn-ghost"
    >
      <LogOut size={16} />
      <span className="content-ar">تسجيل الخروج</span>
      <span className="content-en">Log out</span>
    </button>
  );
}
