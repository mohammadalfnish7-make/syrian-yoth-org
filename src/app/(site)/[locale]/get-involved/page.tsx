import type { Metadata } from "next";
import { InvolveSectionClient } from "@/components/InvolveSectionClient";
import { PageIntro } from "@/components/PageIntro";
import { INVOLVE_CARDS } from "@/lib/site-content";
import { localeMetadata } from "@/lib/locale";
import { getGovernorates } from "@/lib/public-content";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return localeMetadata({
    locale,
    title: "شارك معنا",
    description: "تطوع، أو سجّل في برنامج، أو قدّم مبادرة، أو اطلب شراكة. كل مسار يوضّح الوقت والمطلوب وماذا يحدث بعد الإرسال.",
    path: "/get-involved",
  });
}

export default async function GetInvolvedPage({
  searchParams,
}: {
  searchParams: Promise<{ program?: string }>;
}) {
  const [{ program }, governorates] = await Promise.all([
    searchParams,
    getGovernorates(),
  ]);

  return (
    <main>
      <PageIntro
        eyebrowAr="شارك معنا"
        eyebrowEn="Get involved"
        titleAr="أربع طرق للدخول"
        titleEn="Four ways in"
        ledeAr="قبل أن ترسل الطلب ستجد الوقت المتوقع، وما نحتاجه منك، وماذا يحدث بعد الإرسال."
        ledeEn="Before you send a request you can see the time, what we need from you, and what happens after you submit."
      />
      <section className="section section--gradient">
        <div className="container-yaf">
          <InvolveSectionClient
            cards={INVOLVE_CARDS}
            governorates={governorates}
            initialProgramName={program ?? ""}
            openProgram={Boolean(program)}
          />
        </div>
      </section>
    </main>
  );
}
