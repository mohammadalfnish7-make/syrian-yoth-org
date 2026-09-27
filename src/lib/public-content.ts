import { prisma } from "@/lib/prisma";
import { FALLBACK_EVENTS, PROFILE_IMPACT_STATS } from "@/lib/profile-content";
import {
  DEFAULT_PROGRAMS,
  type ProgramCard,
  type ProgramCardIconKey,
} from "@/lib/site-content";

const PROGRAM_ICONS: ProgramCardIconKey[] = [
  "leadership",
  "skills",
  "initiatives",
  "volunteer",
];

const STAT_NOTES: Record<string, { ar: string; en: string }> = {
  "1500+": {
    ar: "شبكة التطوع المفتوح عبر الفروع.",
    en: "The open volunteer network across branches.",
  },
  "500000+": {
    ar: "منذ التأسيس، وفق الملف التعريفي للمؤسسة.",
    en: "Since founding, as stated in the institutional profile.",
  },
};

for (const stat of PROFILE_IMPACT_STATS) {
  STAT_NOTES[stat.value] = { ar: stat.noteAr, en: stat.noteEn };
}

export type PublicEvent = {
  id: string;
  slug: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  cityAr: string;
  cityEn: string;
  startsAt: string | null;
  isRolling: boolean;
  registerPath: string;
};

export async function getPrograms(): Promise<ProgramCard[]> {
  try {
    const programs = await prisma.program.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    if (programs.length === 0) return DEFAULT_PROGRAMS;

    return programs.map((program, index) => ({
      id: program.id,
      slug: program.slug || program.id,
      icon: PROGRAM_ICONS[index % PROGRAM_ICONS.length],
      tag: { ar: "برنامج", en: "Program" },
      title: { ar: program.title, en: program.titleEn || program.title },
      description: {
        ar: program.description,
        en: program.descriptionEn || program.description,
      },
      audience: {
        ar: program.audienceAr || "الشباب السوري",
        en: program.audienceEn || "Syrian youth",
      },
      schedule: {
        ar: program.scheduleAr || "يُعلن الموعد عند فتح التسجيل.",
        en: program.scheduleEn || "Dates are announced when registration opens.",
      },
      where: {
        ar: program.whereAr || "فروع المؤسسة",
        en: program.whereEn || "Foundation branches",
      },
      outcomes: {
        ar: program.outcomesAr || program.description,
        en: program.outcomesEn || program.descriptionEn || program.description,
      },
      imageUrl: program.imageUrl,
    }));
  } catch {
    return DEFAULT_PROGRAMS;
  }
}

export async function getProgramBySlug(slug: string) {
  const programs = await getPrograms();
  return programs.find((program) => program.slug === slug || program.id === slug) ?? null;
}

export type PublicNewsItem = {
  id: string;
  title: string;
  titleEn: string | null;
  body: string;
  bodyEn: string | null;
  coverImageUrl: string | null;
  publishedAt: string | null;
  governorateId: string;
  governorateNameAr: string;
  governorateNameEn: string;
};

export async function getPublishedNews(): Promise<PublicNewsItem[]> {
  try {
    const news = await prisma.news.findMany({
      where: { status: "published" },
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        title: true,
        titleEn: true,
        body: true,
        bodyEn: true,
        coverImageUrl: true,
        publishedAt: true,
        governorateId: true,
        governorate: { select: { nameAr: true, nameEn: true } },
      },
    });

    return news.map((item) => ({
      id: item.id,
      title: item.title,
      titleEn: item.titleEn,
      body: item.body,
      bodyEn: item.bodyEn,
      coverImageUrl: item.coverImageUrl,
      publishedAt: item.publishedAt?.toISOString() ?? null,
      governorateId: item.governorateId,
      governorateNameAr: item.governorate.nameAr,
      governorateNameEn: item.governorate.nameEn || item.governorate.nameAr,
    }));
  } catch {
    return [];
  }
}

export async function getNewsById(id: string) {
  const news = await getPublishedNews();
  return news.find((item) => item.id === id) ?? null;
}

export async function getEvents(): Promise<PublicEvent[]> {
  try {
    const events = await prisma.event.findMany({
      where: { isActive: true },
      orderBy: [{ isRolling: "desc" }, { startsAt: "asc" }, { sortOrder: "asc" }],
    });

    if (events.length === 0) {
      return FALLBACK_EVENTS.map(toPublicEvent);
    }

    return events.map((event) => ({
      id: event.id,
      slug: event.slug,
      titleAr: event.titleAr,
      titleEn: event.titleEn || event.titleAr,
      descriptionAr: event.descriptionAr,
      descriptionEn: event.descriptionEn || event.descriptionAr,
      cityAr: event.cityAr,
      cityEn: event.cityEn || event.cityAr,
      startsAt: event.startsAt?.toISOString() ?? null,
      isRolling: event.isRolling,
      registerPath: event.registerPath,
    }));
  } catch {
    return FALLBACK_EVENTS.map(toPublicEvent);
  }
}

function toPublicEvent(event: (typeof FALLBACK_EVENTS)[number]): PublicEvent {
  return { ...event };
}

export async function getPartners() {
  try {
    return await prisma.partner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  } catch {
    return [];
  }
}

export async function getImpactStats() {
  const fallback = PROFILE_IMPACT_STATS.map((stat) => ({
    id: stat.id,
    value: stat.value,
    labelAr: stat.labelAr,
    labelEn: stat.labelEn,
    sublabelAr: stat.noteAr,
    sublabelEn: stat.noteEn,
  }));

  try {
    const stats = await prisma.impactStat.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    if (stats.length === 0) return fallback;

    return stats.map((stat) => {
      const note = stat.noteAr
        ? { ar: stat.noteAr, en: stat.noteEn || stat.noteAr }
        : STAT_NOTES[stat.value] || { ar: "", en: "" };

      return {
        id: stat.id,
        value: stat.value,
        labelAr: stat.labelAr,
        labelEn: stat.labelEn || stat.labelAr,
        sublabelAr: note.ar,
        sublabelEn: note.en,
      };
    });
  } catch {
    return fallback;
  }
}

export async function getGovernorates() {
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
  } catch {
    return [];
  }
}

export async function getBoardMembers() {
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
  } catch {
    return [];
  }
}
