import { prisma } from "@/lib/prisma";
import { getPublicSettings } from "@/lib/settings";
import {
  DEFAULT_PROGRAMS,
  INVOLVE_CARDS,
} from "@/lib/site-content";
import { FocusAreasSection } from "@/components/FocusAreasSection";
import { getFocusAreas, getWhatWeDoSection } from "@/lib/focus-areas";
import { InvolveCardIcon } from "@/components/InvolveCardIcon";
import { ProgramsCarousel } from "@/components/ProgramsCarousel";
import { GovernorateNewsSection } from "@/components/GovernorateNewsSection";
import { BoardMembersSection } from "@/components/BoardMembersSection";
import { HeroVideoBackground } from "@/components/HeroVideoBackground";
import { AnimatedStatValue } from "@/components/AnimatedStatValue";
import type { ProgramCardIconKey } from "@/lib/site-content";

export const dynamic = "force-dynamic";

const FALLBACK_STATS = [
  {
    id: "stat-1",
    value: "10",
    labelAr: "محافظات",
    labelEn: "Governorates",
    sublabelAr: "تغطية على مستوى الوطن",
    sublabelEn: "Nationwide coverage",
  },
  {
    id: "stat-2",
    value: "1,500+",
    labelAr: "متطوع",
    labelEn: "Volunteers",
    sublabelAr: "شبكة متطوعين نشطة",
    sublabelEn: "Active volunteer network",
  },
  {
    id: "stat-3",
    value: "500,000+",
    labelAr: "شاب مستفيد",
    labelEn: "Youth Reached",
    sublabelAr: "منذ التأسيس",
    sublabelEn: "Since founding",
  },
  {
    id: "stat-4",
    value: "100+",
    labelAr: "فعالية",
    labelEn: "Events",
    sublabelAr: "برامج ومبادرات",
    sublabelEn: "Programs and initiatives",
  },
];

async function getImpactStats() {
  try {
    const stats = await prisma.impactStat.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    if (stats.length === 0) return FALLBACK_STATS;

    return stats.map((stat) => ({
      id: stat.id,
      value: stat.value,
      labelAr: stat.labelAr,
      labelEn: stat.labelEn || stat.labelAr,
      sublabelAr: "",
      sublabelEn: "",
    }));
  } catch {
    return FALLBACK_STATS;
  }
}

const PROGRAM_ICONS: ProgramCardIconKey[] = [
  "leadership",
  "skills",
  "initiatives",
  "volunteer",
];

async function getPrograms() {
  try {
    const programs = await prisma.program.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      take: 8,
    });

    if (programs.length === 0) return DEFAULT_PROGRAMS;

    return programs.map((program, index) => ({
      id: program.id,
      icon: PROGRAM_ICONS[index % PROGRAM_ICONS.length],
      tag: { ar: "برنامج", en: "Program" },
      title: { ar: program.title, en: program.title },
      description: { ar: program.description, en: program.description },
      imageUrl: program.imageUrl,
    }));
  } catch {
    return DEFAULT_PROGRAMS;
  }
}

async function getGovernorates() {
  try {
    return await prisma.governorate.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        nameAr: true,
        nameEn: true,
        sortOrder: true,
      },
    });
  } catch (error) {
    console.error("Failed to load governorates:", error);
    return [];
  }
}

async function getBoardMembers() {
  try {
    return await prisma.boardMember.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        nameAr: true,
        nameEn: true,
        roleAr: true,
        roleEn: true,
        bioAr: true,
        bioEn: true,
        imageUrl: true,
      },
    });
  } catch (error) {
    console.error("Failed to load board members:", error);
    return [];
  }
}

async function getNews() {
  try {
    return await prisma.news.findMany({
      where: { status: "published" },
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        title: true,
        body: true,
        coverImageUrl: true,
        publishedAt: true,
        governorateId: true,
        governorate: { select: { nameAr: true, nameEn: true } },
      },
    });
  } catch (error) {
    console.error("Failed to load published news:", error);
    return [];
  }
}

export default async function HomePage() {
  const [settings, stats, programs, governorates, news, boardMembers, whatWeDo, focusAreas] =
    await Promise.all([
      getPublicSettings(),
      getImpactStats(),
      getPrograms(),
      getGovernorates(),
      getNews(),
      getBoardMembers(),
      getWhatWeDoSection(),
      getFocusAreas(),
    ]);

  return (
    <main>
      <section className="hero-section" id="home">
        <HeroVideoBackground />
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

          <div className="hero-actions">
            <a href="#programs" className="btn-secondary content-ar">
              استكشف برامجنا
            </a>
            <a href="#programs" className="btn-secondary content-en">
              Explore Our Programs
            </a>
            <a href="#involve" className="btn-outline content-ar">
              شارك معنا
            </a>
            <a href="#involve" className="btn-outline content-en">
              Get Involved
            </a>
          </div>

          <div className="hero-stats">
            {stats.map((stat) => (
              <div key={stat.id} className="hero-stat">
                <AnimatedStatValue
                  value={stat.value}
                  className="hero-stat__value"
                />
                <span className="hero-stat__label content-ar">{stat.labelAr}</span>
                <span className="hero-stat__label content-en">
                  {stat.labelEn}
                </span>
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
                value={settings.about.yearsOfExperience}
                className="about-highlight__value"
                durationMs={1800}
              />
              <div className="about-highlight__label content-ar">
                عاماً من العمل الميداني
              </div>
              <div className="about-highlight__label content-en">
                Years of Field Work
              </div>
            </div>

            <div className="about-content">
              <span className="section-label content-ar">من نحن</span>
              <span className="section-label content-en">Who We Are</span>
              <h2 className="section-title content-ar">
                مؤسسة شبابية سورية بروح قيادية
              </h2>
              <h2 className="section-title content-en">
                A Syrian Youth Foundation with a Leadership Spirit
              </h2>
              <p className="section-desc content-ar">{settings.about.vision.ar}</p>
              <p className="section-desc content-en">{settings.about.vision.en}</p>

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
            <h2 className="section-title section-title--light content-ar">
              أرقام تتحدث عن نفسها
            </h2>
            <h2 className="section-title section-title--light content-en">
              Numbers That Speak for Themselves
            </h2>
          </div>

          <div className="impact-grid">
            {stats.map((stat) => (
              <div key={stat.id} className="impact-item">
                <AnimatedStatValue
                  value={stat.value}
                  className="impact-item__number"
                />
                <div className="impact-item__label content-ar">{stat.labelAr}</div>
                <div className="impact-item__label content-en">
                  {stat.labelEn}
                </div>
                {stat.sublabelAr ? (
                  <>
                    <div className="impact-item__sublabel content-ar">
                      {stat.sublabelAr}
                    </div>
                    <div className="impact-item__sublabel content-en">
                      {stat.sublabelEn}
                    </div>
                  </>
                ) : null}
              </div>
            ))}
          </div>
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
              برامج عملية مصممة لبناء مهارات الشباب وتمكينهم من قيادة التغيير في
              مجتمعاتهم
            </p>
            <p className="section-desc content-en">
              Practical programs designed to build youth skills and empower them to
              lead change in their communities
            </p>
          </div>

          <ProgramsCarousel programs={programs} />
        </div>
      </section>

      <section className="section" id="news">
        <div className="container-yaf">
          <div className="section-header">
            <span className="section-label content-ar">الأخبار والقصص</span>
            <span className="section-label content-en">News &amp; Stories</span>
            <h2 className="section-title content-ar">قصص من الميدان</h2>
            <h2 className="section-title content-en">Stories from the Field</h2>
          </div>

          <GovernorateNewsSection
            governorates={governorates}
            news={news.map((item) => ({
              ...item,
              publishedAt: item.publishedAt?.toISOString() ?? null,
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
                فريق قيادة مؤسسة شباب سوريا الذي يوجّه رؤيتنا ورسالتنا
              </p>
              <p className="section-desc content-en">
                The leadership team guiding our foundation&apos;s vision and mission
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
            <h2 className="section-title section-title--light content-ar">
              كن جزءاً من التغيير
            </h2>
            <h2 className="section-title section-title--light content-en">
              Be Part of the Change
            </h2>
          </div>

          <div className="involve-grid" id="opportunities">
            {INVOLVE_CARDS.map((card) => (
              <div key={card.title.en} className="involve-card">
                <div className={`involve-card__icon involve-card__icon--${card.icon}`}>
                  <InvolveCardIcon name={card.icon} />
                </div>
                <h3 className="involve-card__title content-ar">{card.title.ar}</h3>
                <h3 className="involve-card__title content-en">{card.title.en}</h3>
                <p className="involve-card__desc content-ar">
                  {card.description.ar}
                </p>
                <p className="involve-card__desc content-en">
                  {card.description.en}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
