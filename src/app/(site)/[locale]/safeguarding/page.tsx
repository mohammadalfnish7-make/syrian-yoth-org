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
    title: "الحماية",
    description: "ضوابط حماية الطفل في نادي اليافعين، وكيف تُبلّغ عن قلق.",
    path: "/safeguarding",
  });
}

export default function SafeguardingPage() {
  return (
    <main>
      <PageIntro
        eyebrowAr="الحماية"
        eyebrowEn="Safeguarding"
        titleAr="مساحة آمنة، لا نشاط بلا ضابط"
        titleEn="A safe space, not activity without a rule"
      />
      <section className="section">
        <div className="container-yaf legal-copy">
          <p className="content-ar">
            نادي اليافعين مساحة تربوية وثقافية وترفيهية تكتشف المواهب ضمن ضوابط حماية الطفل. النشاط مع اليافعين يجري بعلم الفرع وموافقة ولي الأمر، لا بطلب يرسله اليافع وحده.
          </p>
          <p className="content-en">
            The Adolescents&apos; Club is an educational, cultural, and recreational space that discovers talent within child-protection safeguards. Work with adolescents happens with the branch&apos;s knowledge and a guardian&apos;s consent, not through a form a young adolescent sends alone.
          </p>
          <p className="content-ar">
            إذا راودك قلق على يافع في نشاط للمؤسسة، اكتب إلى info@syrianyouth.com أو اتصل بالرقم المنشور في صفحة التواصل. اذكر الفرع وما حدث، من دون نشر صور أو أسماء الأطفال على العلن.
          </p>
          <p className="content-en">
            If you are worried about an adolescent in a Foundation activity, write to info@syrianyouth.com or call the number on the contact page. Name the branch and what happened, without posting children&apos;s photos or names in public.
          </p>
          <p className="content-ar">
            المؤسسة مستقلة وغير حزبية. الحماية هنا حماية للشخص، لا أداة لفرز الشباب حسب انتمائهم.
          </p>
          <p className="content-en">
            The Foundation is independent and non-partisan. Safeguarding protects the person. It is not a tool for sorting young people by affiliation.
          </p>
        </div>
      </section>
    </main>
  );
}
