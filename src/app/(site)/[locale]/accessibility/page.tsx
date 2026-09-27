import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { localeMetadata } from "@/lib/locale";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return localeMetadata({
    locale,
    title: "الإتاحة",
    description: "نهدف إلى WCAG 2.2 بمستوى AA، وكيف تبلّغ عن عائق في الموقع.",
    path: "/accessibility",
  });
}

export default function AccessibilityPage() {
  return (
    <main>
      <PageIntro
        eyebrowAr="الإتاحة"
        eyebrowEn="Accessibility"
        titleAr="الموقع لمن يحتاجه"
        titleEn="The site is for the people who need it"
      />
      <section className="section">
        <div className="container-yaf legal-copy">
          <p className="content-ar">
            نهدف إلى مستوى AA من إرشادات WCAG 2.2: نص يمكن تمييزه، وتنقل بلوحة المفاتيح، وحقول نماذج لها تسميات ظاهرة، وصور تحمل وصفاً حين تحمل معنى. العربية هي اللغة الأولى، والإنجليزية صفحة بعنوانها الخاص.
          </p>
          <p className="content-en">
            We aim for WCAG 2.2 Level AA: text you can distinguish, keyboard use, form fields with visible labels, and descriptions on images that carry meaning. Arabic is the primary language, and English has its own address.
          </p>
          <p className="content-ar">
            إذا واجهك عائق، اكتب إلى info@syrianyouth.com واذكر الصفحة وما الذي تعذّر. نعدّل العائق، ويمكننا أيضاً إكمال الطلب معك بالهاتف.
          </p>
          <p className="content-en">
            If you hit a barrier, write to info@syrianyouth.com and name the page and what failed. We will correct the barrier, and we can also complete a request with you by phone.
          </p>
        </div>
      </section>
    </main>
  );
}
