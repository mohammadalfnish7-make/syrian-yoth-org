import type { Metadata } from "next";
import { qomraArabic } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "مؤسسة شباب سوريا | Syrian Youth Foundation",
    template: "%s | مؤسسة شباب سوريا",
  },
  description:
    "مؤسسة شباب سوريا — نصنع من طاقة الشباب قيادةً تبني، لا فعاليات تمر.",
  keywords: ["شباب", "سوريا", "تطوع", "مؤسسة", "شباب سوريا"],
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

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
