import { prisma } from "@/lib/prisma";
import type { FocusAreaIconKey } from "@/lib/site-content";

export type WhatWeDoSection = {
  labelAr: string;
  labelEn: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
};

export type PublicFocusArea = {
  id: string;
  icon: FocusAreaIconKey;
  title: { ar: string; en: string };
  description: { ar: string; en: string };
  image: string;
};

export const FOCUS_AREA_ICONS: FocusAreaIconKey[] = [
  "leadership",
  "skills",
  "initiatives",
  "community",
  "opportunities",
];

const DEFAULT_SECTION: WhatWeDoSection = {
  labelAr: "ماذا نفعل",
  labelEn: "What We Do",
  titleAr: "محاور عملنا الأساسية",
  titleEn: "Our Core Focus Areas",
  descAr:
    "نعمل عبر خمسة محاور استراتيجية لبناء جيل قادر على قيادة مستقبل سوريا",
  descEn:
    "We work across five strategic pillars to build a generation capable of leading Syria's future",
};

const DEFAULT_FOCUS_AREAS: PublicFocusArea[] = [
  {
    id: "leadership",
    icon: "leadership",
    image: "/images/hero/homs-youth.webp",
    title: { ar: "القيادة", en: "Leadership" },
    description: {
      ar: "تنمية قيادات شبابية وبناء مهارات القيادة والتأثير",
      en: "Youth leadership development and leadership skills building",
    },
  },
  {
    id: "skills",
    icon: "skills",
    image: "/images/hero/ramadan-session.webp",
    title: { ar: "المهارات والتعلم", en: "Skills & Learning" },
    description: {
      ar: "برامج تدريبية عملية تجهّز الشباب لسوق العمل والمستقبل",
      en: "Practical training programs preparing youth for work and the future",
    },
  },
  {
    id: "initiatives",
    icon: "initiatives",
    image: "/videos/hero-poster.jpg",
    title: { ar: "المبادرات الشبابية", en: "Youth Initiatives" },
    description: {
      ar: "دعم المبادرات المحلية التي يقودها الشباب في مجتمعاتهم",
      en: "Supporting local initiatives led by youth in their communities",
    },
  },
  {
    id: "community",
    icon: "community",
    image: "/images/hero/ramadan-session.webp",
    title: { ar: "الانخراط المجتمعي", en: "Community Engagement" },
    description: {
      ar: "تعزيز مشاركة الشباب في الحياة المجتمعية والتطوع",
      en: "Strengthening youth participation in community life and volunteering",
    },
  },
  {
    id: "opportunities",
    icon: "opportunities",
    image: "/images/hero/homs-youth.webp",
    title: { ar: "الفرص", en: "Opportunities" },
    description: {
      ar: "ربط الشباب بفرص التدريب والتطوع والشراكات",
      en: "Connecting youth with training, volunteering, and partnership opportunities",
    },
  },
];

const ICON_FALLBACK_IMAGES: Record<FocusAreaIconKey, string> = {
  leadership: "/images/hero/homs-youth.webp",
  skills: "/images/hero/ramadan-session.webp",
  initiatives: "/videos/hero-poster.jpg",
  community: "/images/hero/ramadan-session.webp",
  opportunities: "/images/hero/homs-youth.webp",
};

function parseIcon(value: string): FocusAreaIconKey {
  if (FOCUS_AREA_ICONS.includes(value as FocusAreaIconKey)) {
    return value as FocusAreaIconKey;
  }
  return "leadership";
}

export function getDefaultWhatWeDoSection(): WhatWeDoSection {
  return structuredClone(DEFAULT_SECTION);
}

export function getDefaultFocusAreas(): PublicFocusArea[] {
  return structuredClone(DEFAULT_FOCUS_AREAS);
}

export async function getWhatWeDoSection(): Promise<WhatWeDoSection> {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "what_we_do" },
    });
    if (!setting?.value || typeof setting.value !== "object") {
      return getDefaultWhatWeDoSection();
    }
    const v = setting.value as Partial<WhatWeDoSection>;
    const defaults = getDefaultWhatWeDoSection();
    return {
      labelAr: v.labelAr ?? defaults.labelAr,
      labelEn: v.labelEn ?? defaults.labelEn,
      titleAr: v.titleAr ?? defaults.titleAr,
      titleEn: v.titleEn ?? defaults.titleEn,
      descAr: v.descAr ?? defaults.descAr,
      descEn: v.descEn ?? defaults.descEn,
    };
  } catch {
    return getDefaultWhatWeDoSection();
  }
}

export async function getFocusAreas(): Promise<PublicFocusArea[]> {
  try {
    const rows = await prisma.focusArea.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    if (rows.length === 0) return getDefaultFocusAreas();

    return rows.map((row) => {
      const icon = parseIcon(row.icon);
      return {
        id: row.id,
        icon,
        image:
          row.imageUrl ||
          ICON_FALLBACK_IMAGES[icon] ||
          "/images/hero/homs-youth.webp",
        title: {
          ar: row.titleAr,
          en: row.titleEn || row.titleAr,
        },
        description: {
          ar: row.descriptionAr,
          en: row.descriptionEn || row.descriptionAr,
        },
      };
    });
  } catch {
    return getDefaultFocusAreas();
  }
}
