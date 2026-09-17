import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Newspaper,
  Inbox,
  Handshake,
  BarChart3,
  ArrowUpLeft,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { getNavItemsForRole } from "@/lib/admin-nav";

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const isSuperAdmin = session.role === "SUPER_ADMIN";
  const navItems = getNavItemsForRole(session.role).filter(
    (item) => item.href !== "/admin/dashboard"
  );

  const quickStats = [
    { label: "المحافظات", value: "14", color: "purple" },
    { label: "الأخبار المنشورة", value: "—", color: "lime" },
    { label: "طلبات جديدة", value: "—", color: "orange" },
    { label: "الشركاء", value: "—", color: "yellow" },
  ];

  return (
    <>
      <AdminPageHeader
        titleAr={`مرحباً، ${session.username}`}
        titleEn={`Welcome, ${session.username}`}
        descriptionAr={
          isSuperAdmin
            ? "إدارة الموقع العام وإعدادات المؤسسة"
            : "إدارة أخبار وطلبات محافظتك"
        }
        descriptionEn={
          isSuperAdmin
            ? "Manage the public site and foundation settings"
            : "Manage your governorate news and requests"
        }
      />

      {/* Stats row */}
      <div className="admin-stats-grid">
        {quickStats.map((stat) => (
          <div key={stat.label} className={`admin-stat-card admin-stat-card--${stat.color}`}>
            <span className="admin-stat-card__value">{stat.value}</span>
            <span className="admin-stat-card__label">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Quick access */}
      <section className="admin-section">
        <h2 className="admin-section__title">
          <span className="content-ar">وصول سريع</span>
          <span className="content-en">Quick Access</span>
        </h2>
        <div className="admin-quick-grid">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="admin-quick-card">
                <div className="admin-quick-card__icon">
                  <Icon size={22} strokeWidth={1.75} />
                </div>
                <div className="admin-quick-card__body">
                  <h3>
                    <span className="content-ar">{item.labelAr}</span>
                    <span className="content-en">{item.labelEn}</span>
                  </h3>
                  {item.descriptionAr && item.descriptionEn && (
                    <p>
                      <span className="content-ar">{item.descriptionAr}</span>
                      <span className="content-en">{item.descriptionEn}</span>
                    </p>
                  )}
                </div>
                <ArrowUpLeft size={16} className="admin-quick-card__arrow" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Placeholder activity */}
      <section className="admin-section">
        <h2 className="admin-section__title">
          <span className="content-ar">النشاط الأخير</span>
          <span className="content-en">Recent Activity</span>
        </h2>
        <div className="admin-empty-state">
          <div className="admin-empty-state__icons">
            <Newspaper size={20} />
            <Inbox size={20} />
            {isSuperAdmin && <Handshake size={20} />}
            {isSuperAdmin && <BarChart3 size={20} />}
          </div>
          <p>
            <span className="content-ar">
              سيظهر هنا آخر الأخبار والطلبات عند بدء الاستخدام
            </span>
            <span className="content-en">
              Latest news and requests will appear here once you start using the panel
            </span>
          </p>
        </div>
      </section>
    </>
  );
}
