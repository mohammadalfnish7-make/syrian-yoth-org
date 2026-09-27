import type { ReactNode } from "react";

type PageIntroProps = {
  eyebrowAr: string;
  eyebrowEn: string;
  titleAr: string;
  titleEn: string;
  ledeAr?: string;
  ledeEn?: string;
  children?: ReactNode;
};

export function PageIntro({
  eyebrowAr,
  eyebrowEn,
  titleAr,
  titleEn,
  ledeAr,
  ledeEn,
  children,
}: PageIntroProps) {
  return (
    <section className="page-hero">
      <div className="container-yaf">
        <span className="section-label content-ar">{eyebrowAr}</span>
        <span className="section-label content-en">{eyebrowEn}</span>
        <h1 className="page-hero__title content-ar">{titleAr}</h1>
        <h1 className="page-hero__title content-en">{titleEn}</h1>
        {ledeAr ? <p className="page-hero__lede content-ar">{ledeAr}</p> : null}
        {ledeEn ? <p className="page-hero__lede content-en">{ledeEn}</p> : null}
        {children}
      </div>
    </section>
  );
}
