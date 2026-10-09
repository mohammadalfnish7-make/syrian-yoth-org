import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HomePageView from "@/components/HomePageView";
import { isLocale, localeMetadata } from "@/lib/locale";
import { getPublicSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const settings = await getPublicSettings();
  return localeMetadata({
    locale,
    title: locale === "en" ? settings.branding.nameEn : settings.branding.nameAr,
    description:
      "مؤسسة مجتمع مدني سورية مستقلة تُعنى ببناء اليافعين والشباب. جيل شاب متمكن وقوي.",
    path: "",
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <HomePageView />;
}
