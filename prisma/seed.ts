import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SYRIAN_GOVERNORATES = [
  { nameAr: "دمشق", nameEn: "Damascus", sortOrder: 1 },
  { nameAr: "ريف دمشق", nameEn: "Rif Dimashq", sortOrder: 2 },
  { nameAr: "حلب", nameEn: "Aleppo", sortOrder: 3 },
  { nameAr: "حمص", nameEn: "Homs", sortOrder: 4 },
  { nameAr: "حماة", nameEn: "Hama", sortOrder: 5 },
  { nameAr: "اللاذقية", nameEn: "Latakia", sortOrder: 6 },
  { nameAr: "طرطوس", nameEn: "Tartus", sortOrder: 7 },
  { nameAr: "إدلب", nameEn: "Idlib", sortOrder: 8 },
  { nameAr: "الرقة", nameEn: "Raqqa", sortOrder: 9 },
  { nameAr: "دير الزور", nameEn: "Deir ez-Zor", sortOrder: 10 },
  { nameAr: "الحسكة", nameEn: "Al-Hasakah", sortOrder: 11 },
  { nameAr: "السويداء", nameEn: "As-Suwayda", sortOrder: 12 },
  { nameAr: "درعا", nameEn: "Daraa", sortOrder: 13 },
  { nameAr: "القنيطرة", nameEn: "Quneitra", sortOrder: 14 },
];

const DEFAULT_IMPACT_STATS = [
  { labelAr: "متطوع", labelEn: "Volunteers", value: "1500+", icon: "users", sortOrder: 1 },
  { labelAr: "شاب مستفيد", labelEn: "Youth Reached", value: "500000+", icon: "heart", sortOrder: 2 },
  { labelAr: "محافظة", labelEn: "Governorates", value: "10", icon: "map", sortOrder: 3 },
  { labelAr: "فعالية", labelEn: "Events", value: "100+", icon: "calendar", sortOrder: 4 },
];

const DEFAULT_FOCUS_AREAS = [
  {
    id: "focus-1",
    titleAr: "القيادة",
    titleEn: "Leadership",
    descriptionAr: "تنمية قيادات شبابية وبناء مهارات القيادة والتأثير",
    descriptionEn: "Youth leadership development and leadership skills building",
    imageUrl: "/images/hero/homs-youth.webp",
    icon: "leadership",
    sortOrder: 1,
  },
  {
    id: "focus-2",
    titleAr: "المهارات والتعلم",
    titleEn: "Skills & Learning",
    descriptionAr: "برامج تدريبية عملية تجهّز الشباب لسوق العمل والمستقبل",
    descriptionEn: "Practical training programs preparing youth for work and the future",
    imageUrl: "/images/hero/ramadan-session.webp",
    icon: "skills",
    sortOrder: 2,
  },
  {
    id: "focus-3",
    titleAr: "المبادرات الشبابية",
    titleEn: "Youth Initiatives",
    descriptionAr: "دعم المبادرات المحلية التي يقودها الشباب في مجتمعاتهم",
    descriptionEn: "Supporting local initiatives led by youth in their communities",
    imageUrl: "/videos/hero-poster.jpg",
    icon: "initiatives",
    sortOrder: 3,
  },
  {
    id: "focus-4",
    titleAr: "الانخراط المجتمعي",
    titleEn: "Community Engagement",
    descriptionAr: "تعزيز مشاركة الشباب في الحياة المجتمعية والتطوع",
    descriptionEn: "Strengthening youth participation in community life and volunteering",
    imageUrl: "/images/hero/ramadan-session.webp",
    icon: "community",
    sortOrder: 4,
  },
  {
    id: "focus-5",
    titleAr: "الفرص",
    titleEn: "Opportunities",
    descriptionAr: "ربط الشباب بفرص التدريب والتطوع والشراكات",
    descriptionEn: "Connecting youth with training, volunteering, and partnership opportunities",
    imageUrl: "/images/hero/homs-youth.webp",
    icon: "opportunities",
    sortOrder: 5,
  },
];

const DEFAULT_WHAT_WE_DO = {
  key: "what_we_do",
  value: {
    labelAr: "ماذا نفعل",
    labelEn: "What We Do",
    titleAr: "محاور عملنا الأساسية",
    titleEn: "Our Core Focus Areas",
    descAr: "نعمل عبر خمسة محاور استراتيجية لبناء جيل قادر على قيادة مستقبل سوريا",
    descEn:
      "We work across five strategic pillars to build a generation capable of leading Syria's future",
  },
};

const DEFAULT_SITE_SETTINGS = [
  {
    key: "contact",
    value: {
      email: "info@syrianyouth.com",
      phone: "5756877",
      address: "دمشق، سوريا",
      website: "www.syrianyouth.com",
    },
  },
  {
    key: "social_links",
    value: {
      facebook: "https://www.facebook.com/Youthafairs",
      instagram: "",
      twitter: "",
      youtube: "",
      linkedin: "",
    },
  },
  {
    key: "hero",
    value: {
      title: "جيلٌ شابٌ متمكنٌ وقوي",
      subtitle: "نصنع من طاقة الشباب السوري قيادةً تبني، لا فعاليات تمر.",
      tagline: "A capable, empowered generation.",
      imageUrl: "/images/hero/ramadan-session.webp",
    },
  },
  {
    key: "about",
    value: {
      mission: {
        ar: "تمكين الشباب السوري من تحويل طاقتهم اللامنة إلى أثر حقيقي في مجتمعهم ووطنهم.",
        en: "Empowering Syrian youth to transform their latent energy into real impact in their communities and nation.",
      },
      vision: {
        ar: "أن نكون المؤسسة الشبابية الرائدة في سوريا، نصنع جيلاً يحوّل طاقته إلى أثر، ووعيه إلى فعل، وانتماءه إلى بناء.",
        en: "To be Syria's leading youth foundation — shaping a generation that turns energy into impact, awareness into action, and belonging into building.",
      },
      values: [
        { ar: "الكرامة", en: "Dignity" },
        { ar: "المسؤولية", en: "Responsibility" },
        { ar: "العدل", en: "Justice" },
        { ar: "الأمانة", en: "Integrity" },
        { ar: "الإحسان", en: "Excellence" },
        { ar: "الانتماء", en: "Belonging" },
        { ar: "التكافل", en: "Solidarity" },
      ],
    },
  },
  {
    key: "branding",
    value: {
      logoUrl: "/images/logo.png",
      logoMarkUrl: null,
      faviconUrl: "/favicon.png",
    },
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  for (const gov of SYRIAN_GOVERNORATES) {
    await prisma.governorate.upsert({
      where: { id: `gov-${gov.sortOrder}` },
      update: {},
      create: {
        id: `gov-${gov.sortOrder}`,
        nameAr: gov.nameAr,
        nameEn: gov.nameEn,
        sortOrder: gov.sortOrder,
      },
    });
  }
  console.log(`✅ ${SYRIAN_GOVERNORATES.length} governorates seeded`);

  for (const stat of DEFAULT_IMPACT_STATS) {
    await prisma.impactStat.upsert({
      where: { id: `stat-${stat.sortOrder}` },
      update: {},
      create: { id: `stat-${stat.sortOrder}`, ...stat },
    });
  }
  console.log(`✅ ${DEFAULT_IMPACT_STATS.length} impact stats seeded`);

  for (const area of DEFAULT_FOCUS_AREAS) {
    await prisma.focusArea.upsert({
      where: { id: area.id },
      update: {},
      create: area,
    });
  }
  console.log(`✅ ${DEFAULT_FOCUS_AREAS.length} focus areas seeded`);

  await prisma.siteSetting.upsert({
    where: { key: DEFAULT_WHAT_WE_DO.key },
    update: {},
    create: DEFAULT_WHAT_WE_DO,
  });
  console.log("✅ What We Do section settings seeded");

  for (const setting of DEFAULT_SITE_SETTINGS) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log(`✅ ${DEFAULT_SITE_SETTINGS.length} site settings seeded`);

  // Seed real news from Facebook page content
  const adminForNews = await prisma.admin.findFirst({ where: { role: "SUPER_ADMIN" } });
  const damascusGov = await prisma.governorate.findFirst({ where: { nameEn: "Damascus" } });
  const aleppoGov = await prisma.governorate.findFirst({ where: { nameEn: "Aleppo" } });
  const tartusGov = await prisma.governorate.findFirst({ where: { nameEn: "Tartus" } });

  if (adminForNews && damascusGov) {
    const DEFAULT_NEWS = [
      {
        id: "news-1",
        governorateId: aleppoGov?.id || damascusGov.id,
        authorId: adminForNews.id,
        title: "لقاء تعاون مع منظمة الإغاثة الإسلامية في حلب",
        titleEn: "Cooperation Meeting with Islamic Relief Worldwide in Aleppo",
        body: "في إطار تعزيز التعاون وتوسيع المساحات المشتركة لخدمة الشباب في سوريا، التقى رئيس مجلس إدارة شؤون الشباب د. معتز عبد الرحيم، برئيس منظمة الإغاثة الإسلامية عبر البحار - مكتب سوريا السيد لبيب الجازر، في مقر المنظمة بحلب.\n\nوتناول اللقاء سبل التعاون المستقبلي، وتفعيل البرامج والمبادرات الشابة، وتوحيد الجهود لبناء مساحات تمكّن الشباب وتفتح أمامهم آفاقاً جديدة للنمو والمشاركة.",
        bodyEn: "As part of strengthening collaboration and creating shared spaces to serve youth in Syria, Dr. Moataz Abdulrahim, Chairman of Syrian Youth Affairs, met with Mr. Labib Al-Jazer, Head of Islamic Relief Worldwide - Syria Office, at the organization's headquarters in Aleppo.\n\nThe meeting focused on future cooperation mechanisms, activating youth programs, and unifying efforts to empower youth with new opportunities for participation and leadership.",
        status: "published" as const,
        publishedAt: new Date("2026-08-12"),
      },
      {
        id: "news-2",
        governorateId: aleppoGov?.id || damascusGov.id,
        authorId: adminForNews.id,
        title: "شراكات جديدة في حلب لدعم تمكين الشباب",
        titleEn: "New Partnerships in Aleppo to Advance Youth Empowerment",
        body: "في إطار تعزيز التعاون وتوسيع آفاق العمل الشبابي، التقى رئيس شؤون الشباب د. معتز عبد الرحيم، برئيس مجلس إدارة جمعية سواعدنا السيد عمار كعدة، في مقر الجمعية بحلب.\n\nتناول اللقاء بحث آليات التعاون المشترك بين الجانبين، وبناء برامج ومبادرات شبابية تساهم في تطوير مهارات الشباب وتمكينهم في مختلف المجالات.",
        bodyEn: "To expand youth initiatives and build impactful local partnerships, Dr. Moataz Abdulrahim, Chairman of Syrian Youth Affairs, met with Mr. Ammar Kaadeh, Chairman of Sawaedna Association, at the association's office in Aleppo.\n\nThe discussions centered on collaborative programs and initiatives that develop youth skills and enable them across key development fields.",
        status: "published" as const,
        publishedAt: new Date("2026-08-06"),
      },
      {
        id: "news-3",
        governorateId: damascusGov.id,
        authorId: adminForNews.id,
        title: "بوصول تجاوز 21 ألف وأكثر من 4,500 مستفيد — نواصل صناعة الأثر",
        titleEn: "Over 21,000 Reached and 4,500 Beneficiaries — Continuing to Make an Impact",
        body: "بوصولٍ تجاوز 21 ألف، وأكثر من 4,500 مستفيد، نواصل صناعة الأثر مع شباب سوريا.\n\nفي شؤون الشباب نؤمن أن الاستثمار الحقيقي يبدأ بالإنسان، وأن كل مساحة نخلقها اليوم هي خطوة نحو مستقبلٍ أقوى لسوريا.\n\n31 فعالية · 45 متطوع نشط · 8 شراكات مؤسسية عبر محافظات حلب وطرطوس ودرعا.",
        bodyEn: "Reaching more than 21,000 people and engaging over 4,500 direct beneficiaries, we continue driving positive change with Syria's youth.\n\nAt Syrian Youth Affairs, we believe true investment begins with people, and every space we build today is a step toward a stronger future for Syria.\n\n31 events · 45 active volunteers · 8 institutional partnerships across Aleppo, Tartus, and Daraa.",
        status: "published" as const,
        publishedAt: new Date("2026-07-31"),
      },
      {
        id: "news-4",
        governorateId: damascusGov.id,
        authorId: adminForNews.id,
        title: "ملتقى \"بالعربي في دمشق\" — تجارب شابة ومساحات مشتركة",
        titleEn: "\"In Arabic in Damascus\" Forum — Youth Experiences & Shared Spaces",
        body: "دمشق ليست مجرد عراقة وتاريخ.. دمشق طاقة، أفكار، وتجارب تتنفس شغفاً!\n\nبالشراكة مع شؤون الشباب ومبادرة مساحات الإعلامية، نلتقي في قلب دمشق القديمة في ملتقى \"بالعربي في دمشق\" تحت شعار \"تجارب شابة ومساحات مشتركة\"، لنستمع إلى قصص شباب استطاعوا صنع الأثر ومشاركة خبراتهم بأسلوب يلهمنا جميعاً.\n\nالمكان: خان أسعد باشا العظم – دمشق القديمة",
        bodyEn: "Damascus is not only deep-rooted history; Damascus is energy, ideas, and experiences vibrant with passion!\n\nIn partnership with Syrian Youth Affairs and Masahat Media Initiative, we gather in the heart of Old Damascus for the 'In Arabic in Damascus' forum under the theme 'Youth Experiences and Shared Spaces,' highlighting inspiring stories of youth creating lasting impact.\n\nVenue: Khan As'ad Pasha al-Azem – Old Damascus",
        status: "published" as const,
        publishedAt: new Date("2026-07-28"),
      },
      {
        id: "news-5",
        governorateId: tartusGov?.id || damascusGov.id,
        authorId: adminForNews.id,
        title: "افتتاح ملتقى يافعي شؤون الشباب في طرطوس",
        titleEn: "Opening of the Syrian Youth Adolescents Forum in Tartus",
        body: "مساحةٌ جديدة… لطاقاتٍ تستحق أن تُكتشف.\n\nبحضور الأستاذ علي حلاق، وعددٍ من ممثلي الجهات الحكومية والمجتمعية، افتُتح ملتقى يافعي شؤون الشباب في طرطوس، لتنطلق مساحة جديدة لليافعين، عنوانها المشاركة، والتعلّم، واكتشاف الذات.\n\nوتضمن الافتتاح فقرات فنية وثقافية قدّمها اليافعون، إلى جانب تكريم نخبة من اليافعين المتطوعين، والإطلاق الرسمي لنادي اليافعين، ليكون امتداداً لهذه التجربة ومساحة دائمة لاحتضان الطاقات والمواهب.",
        bodyEn: "A new empowering space for talents waiting to be discovered.\n\nIn the presence of Mr. Ali Hallaq along with community and institutional partners, the Syrian Youth Adolescents Forum was inaugurated in Tartus, providing young people with an open environment for participation, learning, and self-expression.\n\nThe opening featured cultural and artistic presentations, honors for standout youth volunteers, and the launch of the Adolescents Club as a lasting home for creative potential.",
        status: "published" as const,
        publishedAt: new Date("2026-07-20"),
      },
    ];

    for (const news of DEFAULT_NEWS) {
      const existing = await prisma.news.findUnique({ where: { id: news.id } });
      if (!existing) {
        await prisma.news.create({ data: news });
      } else {
        await prisma.news.update({
          where: { id: news.id },
          data: {
            titleEn: news.titleEn,
            bodyEn: news.bodyEn,
          },
        });
      }
    }
    console.log(`✅ ${DEFAULT_NEWS.length} news articles seeded`);
  }

  const adminUsername = process.env.SEED_ADMIN_USERNAME || "admin";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!adminPassword) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SEED_ADMIN_PASSWORD must be set in production (min 16 characters)");
    }
    console.warn("⚠️  SEED_ADMIN_PASSWORD not set — skipping admin seed in non-production");
  } else if (adminPassword.length < 16) {
    throw new Error("SEED_ADMIN_PASSWORD must be at least 16 characters");
  }

  if (adminPassword) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    await prisma.admin.upsert({
      where: { username: adminUsername },
      update: { passwordHash },
      create: {
        username: adminUsername,
        passwordHash,
        role: "SUPER_ADMIN",
      },
    });
    console.log(`✅ Super admin created: ${adminUsername}`);
  }

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
