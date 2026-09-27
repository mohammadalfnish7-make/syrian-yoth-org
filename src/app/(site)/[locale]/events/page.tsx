import type { Metadata } from "next";
import { EventsList } from "@/components/EventsList";
import { PageIntro } from "@/components/PageIntro";
import { localeMetadata } from "@/lib/locale";
import { getEvents } from "@/lib/public-content";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return localeMetadata({
    locale,
    title: "الفعاليات",
    description: "فعاليات ومسارات مفتوحة لمؤسسة شباب سوريا، مع المدينة وطريقة التسجيل.",
    path: "/events",
  });
}

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <main>
      <PageIntro
        eyebrowAr="الفعاليات"
        eyebrowEn="Events"
        titleAr="المدينة، والوقت، وكيف تسجّل"
        titleEn="The city, the time, and how to register"
        ledeAr="المسارات المستمرة تبقى مفتوحة. الفعالية بتاريخ محدد تظهر بيومها ومدينتها."
        ledeEn="Ongoing paths stay open. A dated event shows its day and city."
      />
      <section className="section">
        <div className="container-yaf">
          <EventsList events={events} />
        </div>
      </section>
    </main>
  );
}
