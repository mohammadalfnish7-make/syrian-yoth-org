import type { Metadata } from "next";
import { qomraArabic } from "@/lib/fonts";
import { getPublicSettings } from "@/lib/settings";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();
  const { nameAr, nameEn } = settings.branding;

  return {
    title: {
      default: `${nameAr} | ${nameEn}`,
      template: `%s | ${nameAr}`,
    },
    description: `${nameAr} — نصنع من طاقة الشباب قيادةً تبني، لا فعاليات تمر.`,
    keywords: [nameAr, nameEn, "شباب", "سوريا", "تطوع"],
    icons: {
      icon: settings.branding.faviconUrl || "/favicon.png",
      apple: settings.branding.faviconUrl || "/favicon.png",
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={qomraArabic.variable}>
      <head>
        <link
          rel="preload"
          href="/videos/hero-poster.jpg"
          as="image"
          fetchPriority="high"
        />
      </head>
      <body className={qomraArabic.className}>{children}</body>
    </html>
  );
}
