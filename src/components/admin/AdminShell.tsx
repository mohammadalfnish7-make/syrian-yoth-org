"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronLeft, ExternalLink } from "lucide-react";
import type { AdminRole } from "@prisma/client";
import { getNavItemsForRole } from "@/lib/admin-nav";
import { LogoutButton } from "./LogoutButton";

type AdminShellProps = {
  children: React.ReactNode;
  session: {
    username: string;
    role: AdminRole;
    governorateId: string | null;
  };
};

function syncAdminLang(isEnglish: boolean) {
  document.documentElement.lang = isEnglish ? "en" : "ar";
  document.documentElement.dir = isEnglish ? "ltr" : "rtl";
}

export function AdminShell({ children, session }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const navItems = getNavItemsForRole(session.role);

  useEffect(() => {
    const saved = localStorage.getItem("admin-lang");
    if (saved === "en") {
      const enInput = document.getElementById("admin-lang-en") as HTMLInputElement | null;
      if (enInput) enInput.checked = true;
      syncAdminLang(true);
    }
  }, []);

  useEffect(() => {
    const arInput = document.getElementById("admin-lang-ar");
    const enInput = document.getElementById("admin-lang-en");

    function handleChange() {
      const isEnglish = (enInput as HTMLInputElement)?.checked ?? false;
      localStorage.setItem("admin-lang", isEnglish ? "en" : "ar");
      syncAdminLang(isEnglish);
    }

    arInput?.addEventListener("change", handleChange);
    enInput?.addEventListener("change", handleChange);
    return () => {
      arInput?.removeEventListener("change", handleChange);
      enInput?.removeEventListener("change", handleChange);
    };
  }, []);

  return (
    <>
      <input
        type="radio"
        id="admin-lang-ar"
        className="admin-lang-toggle"
        name="admin-lang"
        defaultChecked
      />
      <input type="radio" id="admin-lang-en" className="admin-lang-toggle" name="admin-lang" />

      <div className="admin-shell">
        {sidebarOpen && (
          <button
            type="button"
            className="admin-shell__overlay"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          />
        )}

        <aside
          className={`admin-shell__sidebar ${sidebarOpen ? "admin-shell__sidebar--open" : ""}`}
        >
          <div className="admin-shell__sidebar-header">
            <Link href="/admin/dashboard" className="admin-shell__brand">
              <Image
                src="/images/logo.png"
                alt="Youth Affairs Foundation"
                width={36}
                height={36}
                className="admin-shell__brand-logo"
              />
              <div>
                <span className="admin-shell__brand-name content-ar">شؤون الشباب</span>
                <span className="admin-shell__brand-name content-en">Youth Affairs</span>
                <span className="admin-shell__brand-sub content-ar">لوحة التحكم</span>
                <span className="admin-shell__brand-sub content-en">Admin Panel</span>
              </div>
            </Link>
            <button
              type="button"
              className="admin-shell__close-btn lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="admin-shell__nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`admin-shell__nav-link ${isActive ? "admin-shell__nav-link--active" : ""}`}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.25 : 1.75} />
                  <span className="content-ar">{item.labelAr}</span>
                  <span className="content-en">{item.labelEn}</span>
                </Link>
              );
            })}
          </nav>

          <div className="admin-shell__sidebar-footer">
            <Link href="/" target="_blank" className="admin-shell__site-link">
              <ExternalLink size={16} />
              <span className="content-ar">عرض الموقع</span>
              <span className="content-en">View Site</span>
            </Link>
          </div>
        </aside>

        <div className="admin-shell__main">
          <header className="admin-shell__topbar">
            <button
              type="button"
              className="admin-shell__menu-btn lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            <div className="admin-shell__topbar-actions">
              <div className="admin-lang-switch" role="group" aria-label="Language">
                <label htmlFor="admin-lang-ar" className="admin-lang-switch__btn">
                  AR
                </label>
                <label htmlFor="admin-lang-en" className="admin-lang-switch__btn">
                  EN
                </label>
              </div>

              <div className="admin-shell__topbar-user">
                <div className="admin-shell__avatar">
                  {session.username.charAt(0).toUpperCase()}
                </div>
                <div className="admin-shell__user-info">
                  <span className="admin-shell__user-name">{session.username}</span>
                  <span className="admin-shell__user-role content-ar">
                    {session.role === "SUPER_ADMIN" ? "مدير النظام" : "أدمن محافظة"}
                  </span>
                  <span className="admin-shell__user-role content-en">
                    {session.role === "SUPER_ADMIN" ? "Super Admin" : "Governorate Admin"}
                  </span>
                </div>
                <LogoutButton variant="icon" />
              </div>
            </div>
          </header>

          <main className="admin-shell__content">{children}</main>
        </div>
      </div>
    </>
  );
}

export function AdminPageHeader({
  titleAr,
  titleEn,
  descriptionAr,
  descriptionEn,
  backHref,
}: {
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  backHref?: string;
}) {
  return (
    <div className="admin-page-header">
      {backHref && (
        <Link href={backHref} className="admin-page-header__back">
          <ChevronLeft size={18} className="admin-page-header__back-icon" />
          <span className="content-ar">رجوع</span>
          <span className="content-en">Back</span>
        </Link>
      )}
      <h1 className="admin-page-header__title">
        <span className="content-ar">{titleAr}</span>
        <span className="content-en">{titleEn}</span>
      </h1>
      {descriptionAr && descriptionEn && (
        <p className="admin-page-header__desc">
          <span className="content-ar">{descriptionAr}</span>
          <span className="content-en">{descriptionEn}</span>
        </p>
      )}
    </div>
  );
}
