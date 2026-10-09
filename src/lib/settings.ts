import { DEFAULT_ABOUT } from "@/lib/about-defaults";
import { normalizeAboutSettings } from "@/lib/normalize-about";
import { ORG_NAME, PROFILE_MISSION, PROFILE_VISION } from "@/lib/profile-content";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_HERO_VIDEO_URL,
  type BrandingSettings,
  type ContactSettings,
  type HeroSettings,
  type PublicSettings,
  type SocialLinksSettings,
} from "@/types/site";

const DEFAULT_SETTINGS: PublicSettings = {
  contact: {
    email: "info@syrianyouth.com",
    phone: "5756877",
    address: "دمشق، سوريا",
    website: "www.syrianyouth.com",
  },
  social_links: {
    facebook: "",
    instagram: "",
    twitter: "",
    youtube: "",
    linkedin: "",
  },
  hero: {
    title: "جيلٌ شابٌ متمكنٌ وقوي",
    subtitle: "نصنع من طاقة الشباب السوري قيادةً تبني، لا فعاليات تمر.",
    tagline: "A capable, empowered generation.",
    imageUrl: "/images/hero/ramadan-session.webp",
    videoUrl: DEFAULT_HERO_VIDEO_URL,
  },
  about: DEFAULT_ABOUT,
  branding: {
    nameAr: ORG_NAME.ar,
    nameEn: ORG_NAME.en,
    logoUrl: "/images/logo.png",
    logoMarkUrl: null,
    faviconUrl: "/favicon.png",
  },
};

export function getDefaultSettings(): PublicSettings {
  return structuredClone(DEFAULT_SETTINGS);
}

export async function getPublicSettings(): Promise<PublicSettings> {
  try {
    const settings = await prisma.siteSetting.findMany({
      where: {
        key: { in: ["contact", "social_links", "hero", "about", "branding"] },
      },
    });

    const merged = getDefaultSettings();

    for (const setting of settings) {
      switch (setting.key) {
        case "contact":
          merged.contact = {
            ...merged.contact,
            ...(setting.value as ContactSettings),
          };
          break;
        case "social_links":
          merged.social_links = {
            ...merged.social_links,
            ...(setting.value as SocialLinksSettings),
          };
          break;
        case "hero":
          merged.hero = { ...merged.hero, ...(setting.value as HeroSettings) };
          break;
        case "about":
          merged.about = normalizeAboutSettings(setting.value, merged.about);
          break;
        case "branding": {
          const stored = setting.value as Partial<BrandingSettings>;
          merged.branding = {
            ...merged.branding,
            ...stored,
            nameAr: stored.nameAr || merged.branding.nameAr,
            nameEn: stored.nameEn || merged.branding.nameEn,
          };
          break;
        }
      }
    }

    if (
      merged.about.mission.ar ===
      "تمكين الشباب السوري من تحويل طاقتهم اللامنة إلى أثر حقيقي في مجتمعهم ووطنهم."
    ) {
      merged.about.mission = { ...PROFILE_MISSION };
    }
    if (
      merged.about.vision.en ===
      "To be Syria's leading youth foundation — shaping a generation that turns energy into impact, awareness into action, and belonging into building."
    ) {
      merged.about.vision = { ...PROFILE_VISION };
    }
    if (!merged.about.yearsOfExperience || merged.about.yearsOfExperience === "+15") {
      merged.about.yearsOfExperience = "10";
    }

    return merged;
  } catch {
    return getDefaultSettings();
  }
}
