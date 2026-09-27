import type { Metadata } from "next";
import { LocaleLink } from "@/components/LocaleLink";
import { PageIntro } from "@/components/PageIntro";
import { AnimatedStatValue } from "@/components/AnimatedStatValue";
import { localeMetadata } from "@/lib/locale";
import { getImpactStats, getPublishedNews } from "@/lib/public-content";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return localeMetadata({
    locale,
    title: "الأثر",
    description: "عشر محافظات، أكثر من 1500 متطوع، أكثر من نصف مليون شاب، وأكثر من 400 قائد في برنامج قائد.",
    path: "/impact",
  });
}

export default async function ImpactPage() {
  const [stats, news] = await Promise.all([getImpactStats(), getPublishedNews()]);
  const fieldStory = news.find((item) => item.title.includes("يافع")) ?? news[0];

  return (
    <main>
      <PageIntro
        eyebrowAr="الأثر"
        eyebrowEn="Impact"
        titleAr="نقيس التغيير، لا عدد الفعاليات"
        titleEn="We measure change, not the number of events"
        ledeAr="الأرقام أدناه من الملف التعريفي للمؤسسة. كل رقم معه ما يعنيه."
        ledeEn="The figures below come from the Foundation's institutional profile. Each number says what it means."
      />
      <section className="section section--purple">
        <div className="container-yaf impact-grid">
          {stats.map((stat) => (
            <div key={stat.id} className="impact-item">
              <AnimatedStatValue value={stat.value} className="impact-item__number" />
              <div className="impact-item__label content-ar">{stat.labelAr}</div>
              <div className="impact-item__label content-en">{stat.labelEn}</div>
              {stat.sublabelAr ? (
                <>
                  <div className="impact-item__sublabel content-ar">{stat.sublabelAr}</div>
                  <div className="impact-item__sublabel content-en">{stat.sublabelEn}</div>
                </>
              ) : null}
            </div>
          ))}
        </div>
      </section>
      <section className="section">
        <div className="container-yaf legal-copy">
          <h2 className="content-ar">قصة من الميدان</h2>
          <h2 className="content-en">A story from the field</h2>
          {fieldStory ? (
            <>
              <p className="content-ar">{fieldStory.title}</p>
              <p className="content-en">{fieldStory.titleEn || fieldStory.title}</p>
              <p className="content-ar">{fieldStory.body.split("\n")[0]}</p>
              <p className="content-en">{(fieldStory.bodyEn || fieldStory.body).split("\n")[0]}</p>
              <LocaleLink href={`/news/${fieldStory.id}`} className="text-link content-ar">
                اقرأ القصة كاملة
              </LocaleLink>
              <LocaleLink href={`/news/${fieldStory.id}`} className="text-link content-en">
                Read the full story
              </LocaleLink>
            </>
          ) : (
            <>
              <p className="content-ar">
                برنامج قائد أعدّ أكثر من 400 قائد. ونادي اليافعين مساحة آمنة تُبنى ضمن ضوابط حماية الطفل، ومنها التجربة التي افتُتحت في طرطوس.
              </p>
              <p className="content-en">
                Qa&apos;id has trained more than 400 leaders. The Adolescents&apos; Club is a safe space built under child-protection safeguards, including the club opened in Tartus.
              </p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
