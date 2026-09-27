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
    title: "الخصوصية",
    description: "ما نجمعه من نماذج الموقع، ولماذا، وكيف تطلب حذفه.",
    path: "/privacy",
  });
}

export default function PrivacyPage() {
  return (
    <main>
      <PageIntro
        eyebrowAr="الخصوصية"
        eyebrowEn="Privacy"
        titleAr="بياناتك للرد عليك"
        titleEn="Your details are for the reply"
      />
      <section className="section">
        <div className="container-yaf legal-copy">
          <p className="content-ar">
            نماذج التطوع والبرامج والمبادرات والشراكة تطلب الاسم ورقم الهاتف، وقد تطلب البريد والمحافظة أو فكرة المبادرة. نستخدم هذه البيانات للرد على الطلب ومتابعته داخل الفريق المختص. لا نبيعها، ولا نستخدمها لإعلان تجاري.
          </p>
          <p className="content-en">
            Volunteer, program, initiative, and partnership forms ask for your name and phone number, and may ask for an email, governorate, or initiative idea. We use this to reply and to follow the request inside the relevant team. We do not sell it, and we do not use it for commercial advertising.
          </p>
          <p className="content-ar">
            يبقى الطلب ما دامت متابعته قائمة. لطلب الاطلاع أو التصحيح أو الحذف، اكتب إلى info@syrianyouth.com من البريد الذي استخدمته، أو اذكر رقم الهاتف الذي أرسلت به الطلب.
          </p>
          <p className="content-en">
            A request is kept while it is still being followed. To ask for access, correction, or deletion, write to info@syrianyouth.com from the email you used, or name the phone number on the request.
          </p>
          <p className="content-ar">
            نادي اليافعين لا يُكمل عبر هذا النموذج من دون علم ولي الأمر. لا نطلب من طفل أن يرسل بياناته وحده.
          </p>
          <p className="content-en">
            The Adolescents&apos; Club is not completed through this form without a guardian&apos;s knowledge. We do not ask a child to send their details alone.
          </p>
        </div>
      </section>
    </main>
  );
}
