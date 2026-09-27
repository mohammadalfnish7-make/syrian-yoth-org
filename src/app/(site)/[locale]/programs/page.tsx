import type { Metadata } from "next";
import { LocaleLink } from "@/components/LocaleLink";
import { PageIntro } from "@/components/PageIntro";
import { localeMetadata } from "@/lib/locale";
import { getPrograms } from "@/lib/public-content";

export const dynamic = "force-dynamic";

const PROGRAM_IMAGES = [
  "/images/hero/homs-youth.webp",
  "/images/hero/ramadan-session.webp",
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return localeMetadata({
    locale,
    title: "البرامج",
    description: "قائد، محطات، وجهتك الأكاديمية، نادي اليافعين، التدريبات المتنوعة، والفعاليات الجماهيرية.",
    path: "/programs",
  });
}

export default async function ProgramsPage() {
  const programs = await getPrograms();

  return (
    <main>
      <PageIntro
        eyebrowAr="البرامج"
        eyebrowEn="Programs"
        titleAr="ستة مسارات، وأثر يُقاس"
        titleEn="Six paths, measured by impact"
        ledeAr="كل برنامج يوضّح لمن هو، وأين يجري، وما الذي يغادر به المشارك."
        ledeEn="Each program says who it is for, where it runs, and what a participant leaves with."
      />
      <section className="section">
        <div className="container-yaf program-split">
          {programs.map((program, index) => {
            const image = program.imageUrl || PROGRAM_IMAGES[index % PROGRAM_IMAGES.length];
            return (
              <article
                key={program.slug}
                className={`program-split-row${index % 2 === 1 ? " program-split-row--flip" : ""}`}
              >
                <div className="program-split-row__copy">
                  <h2>
                    <LocaleLink href={`/programs/${program.slug}`} className="content-ar">
                      {program.title.ar}
                    </LocaleLink>
                    <LocaleLink href={`/programs/${program.slug}`} className="content-en">
                      {program.title.en}
                    </LocaleLink>
                  </h2>
                  <p className="content-ar">{program.description.ar}</p>
                  <p className="content-en">{program.description.en}</p>
                </div>
                <div className="program-split-row__media">
                  <img src={image} alt="" />
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
