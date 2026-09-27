import { prisma } from "@/lib/prisma";
import { PROFILE_FOCUS_AREAS } from "@/lib/profile-content";
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

const LEGACY_FOCUS_TITLES = new Set([
  "القيادة",
  "المهارات والتعلم",
  "المبادرات الشبابية",
  "الانخراط المجتمعي",
  "الفرص",
]);

const DEFAULT_FOCUS_AREAS: PublicFocusArea[] = PROFILE_FOCUS_AREAS.map((area) => ({
  id: area.id,
  icon: parseIcon(area.icon),
  image: area.imageUrl,
  title: { ar: area.titleAr, en: area.titleEn },
  description: { ar: area.descriptionAr, en: area.descriptionEn },
}));

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

    if (rows.length === 0 || rows.every((row) => LEGACY_FOCUS_TITLES.has(row.titleAr))) {
      return getDefaultFocusAreas();
    }

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
