import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LocaleLink } from "@/components/LocaleLink";
import { PageIntro } from "@/components/PageIntro";
import { localeMetadata } from "@/lib/locale";
import { getProgramBySlug } from "@/lib/public-content";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const program = await getProgramBySlug(slug);
  return localeMetadata({
    locale,
    title: program?.title.ar ?? "برنامج",
    description: program?.description.ar ?? "",
    path: `/programs/${slug}`,
  });
}

export default async function ProgramPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const program = await getProgramBySlug(slug);
  if (!program) notFound();

  const applyHref = `/get-involved?program=${encodeURIComponent(program.title.ar)}#program`;

  return (
    <main>
      <PageIntro
        eyebrowAr="برنامج"
        eyebrowEn="Program"
        titleAr={program.title.ar}
        titleEn={program.title.en}
        ledeAr={program.description.ar}
        ledeEn={program.description.en}
      />
      <section className="section">
        <div className="container-yaf detail-grid">
          <div>
            <h2 className="content-ar">لمن</h2>
            <h2 className="content-en">Who it is for</h2>
            <p className="content-ar">{program.audience.ar}</p>
            <p className="content-en">{program.audience.en}</p>
          </div>
          <div>
            <h2 className="content-ar">أين</h2>
            <h2 className="content-en">Where</h2>
            <p className="content-ar">{program.where.ar}</p>
            <p className="content-en">{program.where.en}</p>
          </div>
          <div>
            <h2 className="content-ar">متى</h2>
            <h2 className="content-en">When</h2>
            <p className="content-ar">{program.schedule.ar}</p>
            <p className="content-en">{program.schedule.en}</p>
          </div>
          <div>
            <h2 className="content-ar">ما الذي يغادر به المشارك</h2>
            <h2 className="content-en">What someone leaves with</h2>
            <p className="content-ar">{program.outcomes.ar}</p>
            <p className="content-en">{program.outcomes.en}</p>
          </div>
        </div>
        <div className="container-yaf section-cta">
          <LocaleLink href={applyHref} className="btn-primary content-ar">
            قدّم طلب الانضمام
          </LocaleLink>
          <LocaleLink href={applyHref} className="btn-primary content-en">
            Apply to join
          </LocaleLink>
        </div>
      </section>
    </main>
  );
}
