import type { Metadata } from "next";
import { ContactLinks } from "@/components/ContactLinks";
import { LocaleLink } from "@/components/LocaleLink";
import { PageIntro } from "@/components/PageIntro";
import { localeMetadata } from "@/lib/locale";
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
    title: "تواصل",
    description:
      locale === "en"
        ? `Email, phone, and WhatsApp for ${name} in Damascus.`
        : `البريد والهاتف وواتساب ${name} في دمشق.`,
    path: "/contact",
  });
}

export default async function ContactPage() {
  const settings = await getPublicSettings();

  return (
    <main>
      <PageIntro
        eyebrowAr="تواصل"
        eyebrowEn="Contact"
        titleAr="من يجيب"
        titleEn="Who answers"
        ledeAr="دمشق مركز العمل. للانضمام إلى برنامج أو للتطوع استخدم نموذج شارك معنا، فهو يصل إلى الفريق المختص."
        ledeEn="Damascus is the hub. To join a program or volunteer, use the Get Involved form so the request reaches the right team."
      />
      <section className="section">
        <div className="container-yaf legal-copy">
          <ContactLinks contact={settings.contact} />
          <p>
            <LocaleLink href="/get-involved" className="btn-primary content-ar">
              شارك معنا
            </LocaleLink>
            <LocaleLink href="/get-involved" className="btn-primary content-en">
              Get involved
            </LocaleLink>
          </p>
        </div>
      </section>
    </main>
  );
}
