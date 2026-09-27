import type { Metadata } from "next";
import { LocaleLink } from "@/components/LocaleLink";
import { PageIntro } from "@/components/PageIntro";
import { localeMetadata } from "@/lib/locale";
import { getPublishedNews } from "@/lib/public-content";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return localeMetadata({
    locale,
    title: "الأخبار",
    description: "قصص من فروع مؤسسة شباب سوريا، لكل خبر رابط يمكن إرساله.",
    path: "/news",
  });
}

export default async function NewsPage() {
  const news = await getPublishedNews();

  return (
    <main>
      <PageIntro
        eyebrowAr="الأخبار"
        eyebrowEn="News"
        titleAr="قصص من الميدان"
        titleEn="Stories from the field"
        ledeAr="كل خبر له رابط. يمكن لفرع المحافظة أن يرسل القصة كما نُشرت."
        ledeEn="Every story has its own link, so a governorate branch can share it as published."
      />
      <section className="section">
        <div className="container-yaf program-list">
          {news.length === 0 ? (
            <>
              <p className="content-ar">لا توجد أخبار منشورة بعد.</p>
              <p className="content-en">No published stories yet.</p>
            </>
          ) : (
            news.map((item) => (
              <article key={item.id} className="program-card-row">
                <p className="event-card__meta">
                  <span className="content-ar">{item.governorateNameAr}</span>
                  <span className="content-en">{item.governorateNameEn}</span>
                </p>
                <h2>
                  <LocaleLink href={`/news/${item.id}`} className="content-ar">
                    {item.title}
                  </LocaleLink>
                  <LocaleLink href={`/news/${item.id}`} className="content-en">
                    {item.titleEn || item.title}
                  </LocaleLink>
                </h2>
                <p className="content-ar">{item.body.slice(0, 220)}{item.body.length > 220 ? "…" : ""}</p>
                <p className="content-en">
                  {(item.bodyEn || item.body).slice(0, 220)}
                  {(item.bodyEn || item.body).length > 220 ? "…" : ""}
                </p>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
