import type { Metadata } from "next";
import { EventsCarousel } from "@/components/EventsCarousel";
import { EventsList } from "@/components/EventsList";
import { PageIntro } from "@/components/PageIntro";
import { localeMetadata } from "@/lib/locale";
import { getEvents } from "@/lib/public-content";
import { getPublicSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const settings = await getPublicSettings();
  const name = locale === "en" ? settings.branding.nameEn : settings.branding.nameAr;
  return localeMetadata({
    locale,
    title: "الفعاليات",
    description:
      locale === "en"
        ? `Open events and tracks from ${name}, with the city and how to register.`
        : `فعاليات ومسارات مفتوحة لـ${name}، مع المدينة وطريقة التسجيل.`,
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
          <div className="events-showcase">
            <EventsCarousel events={events} showReadMore={false} />
          </div>
          <EventsList events={events} />
        </div>
      </section>
    </main>
  );
}
