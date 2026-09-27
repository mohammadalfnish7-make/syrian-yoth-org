import { notFound } from "next/navigation";
import { LocaleSync } from "@/components/LocaleSync";
import { isLocale } from "@/lib/locale";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const language = locale === "en" ? "en" : "ar";

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){var el=document.getElementById(${JSON.stringify(language === "en" ? "lang-en" : "lang-ar")});if(el)el.checked=true;document.documentElement.lang=${JSON.stringify(language)};document.documentElement.dir=${JSON.stringify(language === "en" ? "ltr" : "rtl")};})();`,
        }}
      />
      <LocaleSync locale={locale} />
      {children}
    </>
  );
}
