import type { PublicSettings } from "@/types/site";

type SiteFooterProps = {
  settings: PublicSettings;
};

export function SiteFooter({ settings }: SiteFooterProps) {
  const { contact } = settings;

  return (
    <footer className="site-footer" id="contact">
      <div className="container-yaf">
        <div className="footer__grid">
          <div className="footer__brand">
            <div className="site-brand">
              <span className="site-brand__name content-ar">مؤسسة شؤون الشباب</span>
              <span className="site-brand__name content-en">
                Youth Affairs Foundation
              </span>
              <span className="site-brand__tag content-ar">سوريا</span>
              <span className="site-brand__tag content-en">Syria</span>
            </div>
            <p className="footer__desc content-ar">
              منظمة سورية مستقلة تمكّن الشباب وتحوّل طاقتهم إلى أثر مجتمعي حقيقي.
            </p>
            <p className="footer__desc content-en">
              An independent Syrian organization empowering youth and turning their
              energy into real community impact.
            </p>
          </div>

          <div className="footer__col">
            <h4 className="footer__heading content-ar">روابط سريعة</h4>
            <h4 className="footer__heading content-en">Quick Links</h4>
            <ul className="footer__links">
              <li>
                <a href="#about" className="content-ar">
                  من نحن
                </a>
                <a href="#about" className="content-en">
                  About
                </a>
              </li>
              <li>
                <a href="#programs" className="content-ar">
                  البرامج
                </a>
                <a href="#programs" className="content-en">
                  Programs
                </a>
              </li>
              <li>
                <a href="#news" className="content-ar">
                  الأخبار
                </a>
                <a href="#news" className="content-en">
                  News
                </a>
              </li>
              <li>
                <a href="#involve" className="content-ar">
                  شارك معنا
                </a>
                <a href="#involve" className="content-en">
                  Get Involved
                </a>
              </li>
            </ul>
          </div>

          <div className="footer__col">
            <h4 className="footer__heading content-ar">تواصل</h4>
            <h4 className="footer__heading content-en">Contact</h4>
            <ul className="footer__contact">
              <li>
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </li>
              <li>
                <a href={`tel:${contact.phone}`}>{contact.phone}</a>
              </li>
              <li>
                <span className="content-ar">{contact.address}</span>
                <span className="content-en">{contact.address}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="content-ar">
            © {new Date().getFullYear()} مؤسسة شؤون الشباب. جميع الحقوق محفوظة.
          </p>
          <p className="content-en">
            © {new Date().getFullYear()} Youth Affairs Foundation. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
