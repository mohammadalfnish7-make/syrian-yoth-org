import Link from "next/link";

const NAV_LINKS = [
  { href: "#about", labelAr: "من نحن", labelEn: "About" },
  { href: "#board", labelAr: "الإدارة", labelEn: "Leadership" },
  { href: "#programs", labelAr: "البرامج", labelEn: "Programs" },
  { href: "#impact", labelAr: "الأثر", labelEn: "Impact" },
  { href: "#opportunities", labelAr: "الفرص", labelEn: "Opportunities" },
  { href: "#news", labelAr: "الأخبار", labelEn: "News" },
  { href: "#contact", labelAr: "تواصل", labelEn: "Contact" },
] as const;

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container-yaf header__inner">
        <Link href="/" className="site-brand">
          <span className="site-brand__name content-ar">مؤسسة شؤون الشباب</span>
          <span className="site-brand__name content-en">
            Youth Affairs Foundation
          </span>
          <span className="site-brand__tag content-ar">سوريا</span>
          <span className="site-brand__tag content-en">Syria</span>
        </Link>

        <label htmlFor="nav-open" id="nav-open-label" className="nav-toggle-btn">
          <span className="visually-hidden">Toggle menu</span>
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </label>

        <nav className="nav">
          <ul className="nav__list">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="nav__link content-ar">
                  {link.labelAr}
                </a>
                <a href={link.href} className="nav__link content-en">
                  {link.labelEn}
                </a>
              </li>
            ))}
          </ul>

          <div className="nav__actions">
            <div className="lang-switch">
              <label htmlFor="lang-ar" id="lang-ar-label" className="lang-switch__btn">
                AR
              </label>
              <label htmlFor="lang-en" id="lang-en-label" className="lang-switch__btn">
                EN
              </label>
            </div>
            <a href="#involve" className="btn-primary btn-primary--compact content-ar">
              انضم إلينا
            </a>
            <a href="#involve" className="btn-primary btn-primary--compact content-en">
              Join Us
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
