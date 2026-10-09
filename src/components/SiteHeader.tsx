import { LangSwitch } from "@/components/LangSwitch";
import { LocaleLink } from "@/components/LocaleLink";
import { DEFAULT_ABOUT } from "@/lib/about-defaults";
import type { PublicSettings } from "@/types/site";

const NAV_LINKS = [
  { href: "/programs", labelAr: "البرامج", labelEn: "Programs" },
  { href: "/events", labelAr: "الفعاليات", labelEn: "Events" },
  { href: "/impact", labelAr: "الأثر", labelEn: "Impact" },
  { href: "/news", labelAr: "الأخبار", labelEn: "News" },
  { href: "/contact", labelAr: "تواصل", labelEn: "Contact" },
] as const;

export function SiteHeader({ settings }: { settings?: PublicSettings }) {
  const aboutLabel = settings?.about.label ?? DEFAULT_ABOUT.label;

  return (
    <header className="site-header">
      <div className="container-yaf header__inner">
        <LocaleLink href="/" className="site-brand">
          {settings?.branding?.logoUrl ? (
            <img src={settings.branding.logoUrl} alt="مؤسسة شباب سوريا" className="h-16 w-auto object-contain" />
          ) : (
            <>
              <span className="site-brand__name content-ar">مؤسسة شباب سوريا</span>
              <span className="site-brand__name content-en">
                Syrian Youth Foundation
              </span>
              <span className="site-brand__tag content-ar">سوريا</span>
              <span className="site-brand__tag content-en">Syria</span>
            </>
          )}
        </LocaleLink>

        <label htmlFor="nav-open" id="nav-open-label" className="nav-toggle-btn">
          <span className="visually-hidden">Toggle menu</span>
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </label>

        <nav className="nav">
          <ul className="nav__list">
            <li>
              <LocaleLink href="/about" className="nav__link content-ar">
                {aboutLabel.ar}
              </LocaleLink>
              <LocaleLink href="/about" className="nav__link content-en">
                {aboutLabel.en}
              </LocaleLink>
            </li>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <LocaleLink href={link.href} className="nav__link content-ar">
                  {link.labelAr}
                </LocaleLink>
                <LocaleLink href={link.href} className="nav__link content-en">
                  {link.labelEn}
                </LocaleLink>
              </li>
            ))}
          </ul>

          <div className="nav__actions">
            <LangSwitch />
            <LocaleLink href="/get-involved" className="btn-primary btn-primary--compact content-ar">
              انضم إلينا
            </LocaleLink>
            <LocaleLink href="/get-involved" className="btn-primary btn-primary--compact content-en">
              Join Us
            </LocaleLink>
          </div>
        </nav>
      </div>
    </header>
  );
}
