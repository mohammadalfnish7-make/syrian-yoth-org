import type { AdminRole } from "@prisma/client";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Settings,
  Handshake,
  BarChart3,
  ClipboardList,
  Layers,
  Users,
  Newspaper,
  Inbox,
  UserCircle2,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  labelAr: string;
  labelEn: string;
  icon: LucideIcon;
  roles?: AdminRole[];
  descriptionAr?: string;
  descriptionEn?: string;
};

export const adminNavItems: AdminNavItem[] = [
  {
    href: "/admin/dashboard",
    labelAr: "نظرة عامة",
    labelEn: "Overview",
    icon: LayoutDashboard,
    descriptionAr: "ملخص النشاط والإحصائيات",
    descriptionEn: "Activity summary and statistics",
  },
  {
    href: "/admin/settings",
    labelAr: "إعدادات الموقع",
    labelEn: "Site Settings",
    icon: Settings,
    roles: ["SUPER_ADMIN"],
    descriptionAr: "الشعار، التواصل، والصفحة الرئيسية",
    descriptionEn: "Logo, contact, and homepage",
  },
  {
    href: "/admin/partners",
    labelAr: "الشركاء",
    labelEn: "Partners",
    icon: Handshake,
    roles: ["SUPER_ADMIN"],
    descriptionAr: "إدارة شعارات وروابط الشركاء",
    descriptionEn: "Manage partner logos and links",
  },
  {
    href: "/admin/board-members",
    labelAr: "أعضاء الإدارة",
    labelEn: "Board Members",
    icon: UserCircle2,
    roles: ["SUPER_ADMIN"],
    descriptionAr: "إدارة أعضاء مجلس الإدارة وصورهم",
    descriptionEn: "Manage board members and photos",
  },
  {
    href: "/admin/stats",
    labelAr: "إحصائيات الأثر",
    labelEn: "Impact Stats",
    icon: BarChart3,
    roles: ["SUPER_ADMIN"],
    descriptionAr: "أرقام التأثير والإنجاز",
    descriptionEn: "Impact and achievement numbers",
  },
  {
    href: "/admin/programs",
    labelAr: "البرامج",
    labelEn: "Programs",
    icon: ClipboardList,
    roles: ["SUPER_ADMIN"],
    descriptionAr: "برامج ومبادرات المؤسسة",
    descriptionEn: "Foundation programs and initiatives",
  },
  {
    href: "/admin/focus-areas",
    labelAr: "محاور العمل",
    labelEn: "Focus Areas",
    icon: Layers,
    roles: ["SUPER_ADMIN"],
    descriptionAr: "قسم ماذا نفعل والبطاقات الخمس",
    descriptionEn: "What We Do section and focus cards",
  },
  {
    href: "/admin/admins",
    labelAr: "إدارة الأدمن",
    labelEn: "Admin Users",
    icon: Users,
    roles: ["SUPER_ADMIN"],
    descriptionAr: "حسابات أدمن المحافظات",
    descriptionEn: "Governorate admin accounts",
  },
  {
    href: "/admin/news",
    labelAr: "الأخبار",
    labelEn: "News",
    icon: Newspaper,
    descriptionAr: "نشر وإدارة الأخبار",
    descriptionEn: "Publish and manage news",
  },
  {
    href: "/admin/requests",
    labelAr: "الطلبات الواردة",
    labelEn: "Incoming Requests",
    icon: Inbox,
    descriptionAr: "طلبات التطوع والشراكة",
    descriptionEn: "Volunteer and partnership requests",
  },
];

export function getNavItemsForRole(role: AdminRole): AdminNavItem[] {
  return adminNavItems.filter(
    (item) => !item.roles || item.roles.includes(role)
  );
}
