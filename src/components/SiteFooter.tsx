import { ContactLinks } from "@/components/ContactLinks";
import { LocaleLink } from "@/components/LocaleLink";
import type { PublicSettings } from "@/types/site";

function FacebookIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  );
}

function InstagramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

type SiteFooterProps = {
  settings: PublicSettings;
};

export function SiteFooter({ settings }: SiteFooterProps) {
  const { contact, social_links } = settings;

  return (
    <footer className="site-footer" id="contact">
      <div className="container-yaf">
        <div className="footer__grid">
          <div className="footer__brand">
            <div className="site-brand">
              <span className="site-brand__name content-ar">مؤسسة شباب سوريا</span>
              <span className="site-brand__name content-en">
                Syrian Youth Foundation
              </span>
              <span className="site-brand__tag content-ar">سوريا</span>
              <span className="site-brand__tag content-en">Syria</span>
            </div>
            <p className="footer__desc content-ar">
              مؤسسة مجتمع مدني سورية مستقلة، تُعنى ببناء اليافعين والشباب في أبعادهم كافة.
            </p>
            <p className="footer__desc content-en">
              An independent Syrian civil society organization dedicated to the holistic
              development of adolescents and youth.
            </p>
            <div className="footer__socials">
              {social_links?.facebook && (
                <a
                  href={social_links.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer__social-link"
                  aria-label="Facebook"
                >
                  <FacebookIcon size={20} />
                </a>
              )}
              {social_links?.instagram && (
                <a
                  href={social_links.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer__social-link"
                  aria-label="Instagram"
                >
                  <InstagramIcon size={20} />
                </a>
              )}
            </div>
          </div>

          <div className="footer__col">
            <h4 className="footer__heading content-ar">روابط سريعة</h4>
            <h4 className="footer__heading content-en">Quick Links</h4>
            <ul className="footer__links">
              <li>
                <LocaleLink href="/about" className="content-ar">
                  من نحن
                </LocaleLink>
                <LocaleLink href="/about" className="content-en">
                  About
                </LocaleLink>
              </li>
              <li>
                <LocaleLink href="/programs" className="content-ar">
                  البرامج
                </LocaleLink>
                <LocaleLink href="/programs" className="content-en">
                  Programs
                </LocaleLink>
              </li>
              <li>
                <LocaleLink href="/news" className="content-ar">
                  الأخبار
                </LocaleLink>
                <LocaleLink href="/news" className="content-en">
                  News
                </LocaleLink>
              </li>
              <li>
                <LocaleLink href="/get-involved" className="content-ar">
                  شارك معنا
                </LocaleLink>
                <LocaleLink href="/get-involved" className="content-en">
                  Get Involved
                </LocaleLink>
              </li>
            </ul>
          </div>

          <div className="footer__col">
            <h4 className="footer__heading content-ar">تواصل</h4>
            <h4 className="footer__heading content-en">Contact</h4>
            <ContactLinks contact={contact} />
          </div>
        </div>

        <div className="footer__bottom">
          <p className="content-ar">
            © {new Date().getFullYear()} مؤسسة شباب سوريا. جميع الحقوق محفوظة.
          </p>
          <p className="content-en">
            © {new Date().getFullYear()} Syrian Youth Foundation. All rights
            reserved.
          </p>
          <nav className="footer__legal" aria-label="Legal">
            <LocaleLink href="/privacy" className="content-ar">
              الخصوصية
            </LocaleLink>
            <LocaleLink href="/privacy" className="content-en">
              Privacy
            </LocaleLink>
            <LocaleLink href="/safeguarding" className="content-ar">
              الحماية
            </LocaleLink>
            <LocaleLink href="/safeguarding" className="content-en">
              Safeguarding
            </LocaleLink>
            <LocaleLink href="/accessibility" className="content-ar">
              الإتاحة
            </LocaleLink>
            <LocaleLink href="/accessibility" className="content-en">
              Accessibility
            </LocaleLink>
          </nav>
        </div>
      </div>
    </footer>
  );
}
