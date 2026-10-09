import { getPublicSettings } from "@/lib/settings";
import { INVOLVE_CARDS } from "@/lib/site-content";
import { FocusAreasSection } from "@/components/FocusAreasSection";
import { getFocusAreas, getWhatWeDoSection } from "@/lib/focus-areas";
import { ProgramsCarousel } from "@/components/ProgramsCarousel";
import { GovernorateNewsSection } from "@/components/GovernorateNewsSection";
import { BoardMembersSection } from "@/components/BoardMembersSection";
import { HeroVideoBackground } from "@/components/HeroVideoBackground";
import { AnimatedStatValue } from "@/components/AnimatedStatValue";
import { InvolveSectionClient } from "@/components/InvolveSectionClient";
import { LocaleLink } from "@/components/LocaleLink";
import { EventsCarousel } from "@/components/EventsCarousel";
import { PROFILE_SLOGAN } from "@/lib/profile-content";
import {
  getBoardMembers,
  getEvents,
  getGovernorates,
  getImpactStats,
  getPartners,
  getPrograms,
  getPublishedNews,
} from "@/lib/public-content";

export default async function HomePageView() {
  const [settings, stats, programs, governorates, news, boardMembers, whatWeDo, focusAreas, partners, events] =
    await Promise.all([
      getPublicSettings(),
      getImpactStats(),
      getPrograms(),
      getGovernorates(),
      getPublishedNews(),
      getBoardMembers(),
      getWhatWeDoSection(),
      getFocusAreas(),
      getPartners(),
      getEvents(),
    ]);

  const fieldStory = news.find((item) => item.title.includes("يافع")) ?? news[0];

  return (
    <main>
      <section className="hero-section" id="home">
        <HeroVideoBackground videoUrl={settings.hero.videoUrl} />
        <div className="container-yaf hero-section__content">
          <div className="hero-badge content-ar">
            <span className="hero-badge__dot" />
            مؤسسة سورية مستقلة في المجتمع المدني
          </div>
          <div className="hero-badge content-en">
            <span className="hero-badge__dot" />
            Independent Syrian Civil Society Organization
          </div>

          <h1 className="hero-title content-ar">
            <span className="hero-title__accent">جيل</span> قادر و
            <span className="hero-title__accent">مُمكَّن</span>
          </h1>
          <h1 className="hero-title content-en">
            A <span className="hero-title__accent">Capable</span>,{" "}
            <span className="hero-title__accent">Empowered</span> Generation
          </h1>

          <p className="hero-subtitle content-ar">{settings.hero.subtitle}</p>
          <p className="hero-subtitle content-en">{settings.hero.tagline}</p>
          <p className="hero-next content-ar">
            {PROFILE_SLOGAN.ar} الخطوة التالية: انضم إلى برنامج، أو تطوّع في محافظتك، أو قدّم مبادرة.
          </p>
          <p className="hero-next content-en">
            {PROFILE_SLOGAN.en} Next step: join a program, volunteer in your governorate, or submit an initiative.
          </p>

          <div className="hero-actions">
            <LocaleLink href="/programs" className="btn-secondary content-ar">
              استكشف برامجنا
            </LocaleLink>
            <LocaleLink href="/programs" className="btn-secondary content-en">
              Explore Our Programs
            </LocaleLink>
            <LocaleLink href="/get-involved#volunteer" className="btn-outline content-ar">
              تطوّع في محافظتك
            </LocaleLink>
            <LocaleLink href="/get-involved#volunteer" className="btn-outline content-en">
              Volunteer locally
            </LocaleLink>
            <LocaleLink href="/get-involved#initiative" className="btn-outline content-ar">
              قدّم مبادرة
            </LocaleLink>
            <LocaleLink href="/get-involved#initiative" className="btn-outline content-en">
              Submit an initiative
            </LocaleLink>
          </div>

          <div className="hero-stats">
            {stats.map((stat) => (
              <div key={stat.id} className="hero-stat">
                <AnimatedStatValue value={stat.value} className="hero-stat__value" />
                <span className="hero-stat__label content-ar">{stat.labelAr}</span>
                <span className="hero-stat__label content-en">{stat.labelEn}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--grey" id="about">
        <div className="container-yaf">
          <div className="about-grid">
            <div className="about-highlight">
              <AnimatedStatValue
                value={settings.about.yearsOfExperience || "10"}
                className="about-highlight__value"
                durationMs={1800}
              />
              <div className="about-highlight__label content-ar">
                {settings.about.presenceLabel.ar}
              </div>
              <div className="about-highlight__label content-en">
                {settings.about.presenceLabel.en}
              </div>
            </div>

            <div className="about-content">
              <span className="section-label content-ar">{settings.about.label.ar}</span>
              <span className="section-label content-en">{settings.about.label.en}</span>
              <h2 className="section-title content-ar">{settings.about.title.ar}</h2>
              <h2 className="section-title content-en">{settings.about.title.en}</h2>
              <p className="section-desc content-ar">{settings.about.mission.ar}</p>
              <p className="section-desc content-en">{settings.about.mission.en}</p>

              <div className="values-row content-ar">
                {settings.about.values.map((value) => (
                  <span key={value.ar} className="value-pill">
                    {value.ar}
                  </span>
                ))}
              </div>
              <div className="values-row content-en">
                {settings.about.values.map((value) => (
                  <span key={value.en} className="value-pill">
                    {value.en}
                  </span>
                ))}
              </div>
              <LocaleLink href="/about" className="text-link content-ar">
                اقرأ قصتنا
              </LocaleLink>
              <LocaleLink href="/about" className="text-link content-en">
                Read our story
              </LocaleLink>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="what-we-do">
        <div className="container-yaf">
          <div className="section-header section-header--center">
            <span className="section-label content-ar">{whatWeDo.labelAr}</span>
            <span className="section-label content-en">{whatWeDo.labelEn}</span>
            <h2 className="section-title content-ar">{whatWeDo.titleAr}</h2>
            <h2 className="section-title content-en">{whatWeDo.titleEn}</h2>
            <p className="section-desc content-ar">{whatWeDo.descAr}</p>
            <p className="section-desc content-en">{whatWeDo.descEn}</p>
          </div>
          <FocusAreasSection areas={focusAreas} />
        </div>
      </section>

      <section className="section section--purple" id="impact">
        <div className="container-yaf">
          <div className="section-header section-header--center">
            <span className="section-label content-ar">الأثر</span>
            <span className="section-label content-en">Our Impact</span>
            <h2 className="section-title section-title--light content-ar">أرقام لها معنى</h2>
            <h2 className="section-title section-title--light content-en">Numbers with a meaning</h2>
          </div>

          <div className="impact-grid">
            {stats.map((stat) => (
              <div key={stat.id} className="impact-item">
                <AnimatedStatValue value={stat.value} className="impact-item__number" />
                <div className="impact-item__label content-ar">{stat.labelAr}</div>
                <div className="impact-item__label content-en">{stat.labelEn}</div>
                {stat.sublabelAr ? (
                  <>
                    <div className="impact-item__sublabel content-ar">{stat.sublabelAr}</div>
                    <div className="impact-item__sublabel content-en">{stat.sublabelEn}</div>
                  </>
                ) : null}
              </div>
            ))}
          </div>
          <p className="section-cta">
            <LocaleLink href="/impact" className="btn-outline content-ar">
              كيف نقيس الأثر
            </LocaleLink>
            <LocaleLink href="/impact" className="btn-outline content-en">
              How we measure impact
            </LocaleLink>
          </p>
        </div>
      </section>

      <section className="section section--grey" id="programs">
        <div className="container-yaf">
          <div className="section-header">
            <span className="section-label content-ar">البرامج</span>
            <span className="section-label content-en">Our Programs</span>
            <h2 className="section-title content-ar">برامج مميزة</h2>
            <h2 className="section-title content-en">Featured Programs</h2>
            <p className="section-desc content-ar">
              من إعداد القادة إلى نادي اليافعين: برامج تُقاس بما تغيّره، لا بعدد الفعاليات.
            </p>
            <p className="section-desc content-en">
              From preparing leaders to the Adolescents&apos; Club: programs measured by the change they make.
            </p>
          </div>
          <ProgramsCarousel programs={programs} />
        </div>
      </section>

      <section className="section" id="events">
        <div className="container-yaf">
          <div className="section-header">
            <span className="section-label content-ar">الفعاليات</span>
            <span className="section-label content-en">Events</span>
            <h2 className="section-title content-ar">ما الذي يجري الآن</h2>
            <h2 className="section-title content-en">What is happening now</h2>
          </div>
          <EventsCarousel events={events} />
        </div>
      </section>

      {partners.length > 0 ? (
        <section className="section section--grey" id="partners">
          <div className="container-yaf">
            <div className="section-header section-header--center">
              <span className="section-label content-ar">الشركاء</span>
              <span className="section-label content-en">Partners</span>
              <h2 className="section-title content-ar">من نعمل معهم</h2>
              <h2 className="section-title content-en">Who we work with</h2>
            </div>
            <ul className="partner-strip">
              {partners.map((partner) => (
                <li key={partner.id}>
                  {partner.websiteUrl ? (
                    <a href={partner.websiteUrl} target="_blank" rel="noopener noreferrer">
                      {partner.logoUrl ? (
                        <img src={partner.logoUrl} alt={partner.name} />
                      ) : (
                        <span>{partner.name}</span>
                      )}
                    </a>
                  ) : partner.logoUrl ? (
                    <img src={partner.logoUrl} alt={partner.name} />
                  ) : (
                    <span>{partner.name}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section className="section" id="news">
        <div className="container-yaf">
          <div className="section-header">
            <span className="section-label content-ar">الأخبار والقصص</span>
            <span className="section-label content-en">News &amp; Stories</span>
            <h2 className="section-title content-ar">قصص من الميدان</h2>
            <h2 className="section-title content-en">Stories from the Field</h2>
            {fieldStory ? (
              <p className="section-desc content-ar">
                منها: {fieldStory.title}
              </p>
            ) : null}
            {fieldStory ? (
              <p className="section-desc content-en">
                Including: {fieldStory.titleEn || fieldStory.title}
              </p>
            ) : null}
          </div>
          <GovernorateNewsSection
            governorates={governorates}
            news={news.map((item) => ({
              id: item.id,
              title: item.title,
              titleEn: item.titleEn,
              body: item.body,
              bodyEn: item.bodyEn,
              coverImageUrl: item.coverImageUrl,
              publishedAt: item.publishedAt,
              governorateId: item.governorateId,
              governorate: {
                nameAr: item.governorateNameAr,
                nameEn: item.governorateNameEn,
              },
            }))}
          />
        </div>
      </section>

      {boardMembers.length > 0 && (
        <section className="section section--grey" id="board">
          <div className="container-yaf">
            <div className="section-header section-header--center">
              <span className="section-label content-ar">قيادة المؤسسة</span>
              <span className="section-label content-en">Our Leadership</span>
              <h2 className="section-title content-ar">أعضاء الإدارة</h2>
              <h2 className="section-title content-en">Board Members</h2>
              <p className="section-desc content-ar">
                فريق القيادة الذي يوجّه الرؤية والرسالة. من هنا يُعرف من يجيب.
              </p>
              <p className="section-desc content-en">
                The leadership team guiding the vision and mission. This is who answers.
              </p>
            </div>
            <BoardMembersSection members={boardMembers} />
          </div>
        </section>
      )}

      <section className="section section--gradient" id="involve">
        <div className="container-yaf">
          <div className="section-header section-header--center">
            <span className="section-label content-ar">شارك معنا</span>
            <span className="section-label content-en">Get Involved</span>
            <h2 className="section-title section-title--light content-ar">كن جزءاً من التغيير</h2>
            <h2 className="section-title section-title--light content-en">Be Part of the Change</h2>
          </div>
          <InvolveSectionClient cards={INVOLVE_CARDS} governorates={governorates} />
        </div>
      </section>
    </main>
  );
}
