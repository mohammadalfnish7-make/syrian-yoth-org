import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageIntro } from "@/components/PageIntro";
import { localeMetadata } from "@/lib/locale";
import { getNewsById } from "@/lib/public-content";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const story = await getNewsById(id);
  return localeMetadata({
    locale,
    title: story?.title ?? "خبر",
    description: (story?.body ?? "").slice(0, 160),
    path: `/news/${id}`,
  });
}

export default async function NewsStoryPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  const story = await getNewsById(id);
  if (!story) notFound();

  return (
    <main>
      <PageIntro
        eyebrowAr={story.governorateNameAr}
        eyebrowEn={story.governorateNameEn}
        titleAr={story.title}
        titleEn={story.titleEn || story.title}
      />
      <article className="section">
        <div className="container-yaf legal-copy">
          {story.coverImageUrl ? (
            <img src={story.coverImageUrl} alt="" className="story-cover" />
          ) : null}
          {story.body.split(/\n{2,}/).map((paragraph) => (
            <p key={paragraph.slice(0, 24)} className="content-ar">
              {paragraph}
            </p>
          ))}
          {(story.bodyEn || story.body).split(/\n{2,}/).map((paragraph) => (
            <p key={`en-${paragraph.slice(0, 24)}`} className="content-en">
              {paragraph}
            </p>
          ))}
        </div>
      </article>
    </main>
  );
}
