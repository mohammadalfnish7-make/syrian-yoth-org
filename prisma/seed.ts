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
      facebook: "",
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
      update: { nameAr: gov.nameAr, nameEn: gov.nameEn, sortOrder: gov.sortOrder },
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
      update: stat,
      create: { id: `stat-${stat.sortOrder}`, ...stat },
    });
  }
  console.log(`✅ ${DEFAULT_IMPACT_STATS.length} impact stats seeded`);

  for (const area of DEFAULT_FOCUS_AREAS) {
    await prisma.focusArea.upsert({
      where: { id: area.id },
      update: area,
      create: area,
    });
  }
  console.log(`✅ ${DEFAULT_FOCUS_AREAS.length} focus areas seeded`);

  await prisma.siteSetting.upsert({
    where: { key: DEFAULT_WHAT_WE_DO.key },
    update: { value: DEFAULT_WHAT_WE_DO.value },
    create: DEFAULT_WHAT_WE_DO,
  });
  console.log("✅ What We Do section settings seeded");

  for (const setting of DEFAULT_SITE_SETTINGS) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log(`✅ ${DEFAULT_SITE_SETTINGS.length} site settings seeded`);

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
      update: {},
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
