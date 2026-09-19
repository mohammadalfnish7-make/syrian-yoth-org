import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getPublicSettings } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();

  return {
    icons: {
      icon: settings.branding.faviconUrl || "/favicon.png",
      apple: settings.branding.faviconUrl || "/favicon.png",
    },
  };
}

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getPublicSettings();

  return (
    <>
      <input
        type="radio"
        id="lang-ar"
        className="lang-toggle"
        name="lang"
        defaultChecked
        aria-labelledby="lang-ar-label"
      />
      <input
        type="radio"
        id="lang-en"
        className="lang-toggle"
        name="lang"
        aria-labelledby="lang-en-label"
      />
      <input
        type="checkbox"
        id="nav-open"
        className="nav-toggle"
        aria-labelledby="nav-open-label"
      />

      <div className="site">
        <SiteHeader settings={settings} />
        {children}
        <SiteFooter settings={settings} />
      </div>
    </>
  );
}
