import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { localeMetadata } from "@/lib/locale";
import {
  ACTIVE_GOVERNORATES,
  PROFILE_PRINCIPLES,
  PROFILE_SLOGAN,
  PROFILE_STORY,
  PROFILE_VALUE_NOTES,
  PROFILE_VISION,
} from "@/lib/profile-content";
import { getPublicSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const settings = await getPublicSettings();
  const title = locale === "en" ? settings.about.label.en : settings.about.label.ar;
  return localeMetadata({
    locale,
    title,
    description: PROFILE_STORY.en,
    path: "/about",
  });
}

export default async function AboutPage() {
  const settings = await getPublicSettings();

  return (
    <main>
      <PageIntro
        eyebrowAr={settings.about.label.ar}
        eyebrowEn={settings.about.label.en}
        titleAr="نحن وعد لهذا الجيل"
        titleEn="A promise to this generation"
        ledeAr={PROFILE_SLOGAN.ar}
        ledeEn={PROFILE_SLOGAN.en}
      />
      <section className="section">
        <div className="container-yaf legal-copy">
          <p className="content-ar">{PROFILE_STORY.ar}</p>
          <p className="content-en">{PROFILE_STORY.en}</p>

          <h2 className="content-ar">الرؤية</h2>
          <h2 className="content-en">Vision</h2>
          <p className="content-ar">{PROFILE_VISION.ar}</p>
          <p className="content-en">{PROFILE_VISION.en}</p>

          <h2 className="content-ar">الرسالة</h2>
          <h2 className="content-en">Mission</h2>
          <p className="content-ar">{settings.about.mission.ar}</p>
          <p className="content-en">{settings.about.mission.en}</p>

          <h2 className="content-ar">كيف نعمل</h2>
          <h2 className="content-en">How we work</h2>
          <p className="content-ar">
            نعمل وفق رؤية كرة الثلج: نزرع الرؤية في مجموعة من الشباب فيحملونها إلى غيرهم، وتتسع الدائرة من تلقاء نفسها. تنتظم المؤسسة في فروع محافظاتية، وينداح أثرها عبر التطوع المفتوح، وشبكة «أصدقاء الشباب السوري»، والمجالس الشبابية التمثيلية.
          </p>
          <p className="content-en">
            We work like a snowball: the vision is planted in a group of young people, they carry it onward, and the circle widens on its own. The Foundation is organized in governorate branches. Its reach spreads through open volunteering, the Friends of Syrian Youth network, and representative youth councils.
          </p>

          <h2 className="content-ar">أين نحن</h2>
          <h2 className="content-en">Where we are</h2>
          <p className="content-ar">
            حضور فاعل في عشر محافظات، ودمشق مركزاً. الفروع المذكورة في الملف التعريفي:
          </p>
          <p className="content-en">
            An active presence across ten governorates, with Damascus as the hub. The branches named in the institutional profile:
          </p>
          <ul className="pill-list">
            {ACTIVE_GOVERNORATES.map((gov) => (
              <li key={gov.en}>
                <span className="content-ar">
                  {gov.ar}
                  {gov.hub ? " (المركز)" : ""}
                </span>
                <span className="content-en">
                  {gov.en}
                  {gov.hub ? " (hub)" : ""}
                </span>
              </li>
            ))}
          </ul>

          <h2 className="content-ar">ما يحكم عملنا</h2>
          <h2 className="content-en">What governs the work</h2>
          <ul className="plain-list">
            {PROFILE_PRINCIPLES.map((item) => (
              <li key={item.en}>
                <span className="content-ar">{item.ar}</span>
                <span className="content-en">{item.en}</span>
              </li>
            ))}
          </ul>

          <h2 className="content-ar">القيم</h2>
          <h2 className="content-en">Values</h2>
          <dl className="value-defs">
            {settings.about.values.map((value, index) => {
              const note = PROFILE_VALUE_NOTES.find((item) => item.ar === value.ar);
              return (
                <div key={`${value.ar}-${index}`}>
                  <dt className="content-ar">{value.ar}</dt>
                  <dt className="content-en">{value.en}</dt>
                  {note ? (
                    <>
                      <dd className="content-ar">{note.noteAr}</dd>
                      <dd className="content-en">{note.noteEn}</dd>
                    </>
                  ) : null}
                </div>
              );
            })}
          </dl>
        </div>
      </section>
    </main>
  );
}
