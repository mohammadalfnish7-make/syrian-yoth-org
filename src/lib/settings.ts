import { normalizeAboutSettings } from "@/lib/normalize-about";
import { prisma } from "@/lib/prisma";
import type {
  BrandingSettings,
  ContactSettings,
  HeroSettings,
  PublicSettings,
  SocialLinksSettings,
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
  },
  about: {
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
    yearsOfExperience: "+15",
  },
  branding: {
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
        case "branding":
          merged.branding = {
            ...merged.branding,
            ...(setting.value as BrandingSettings),
          };
          break;
      }
    }

    return merged;
  } catch {
    return getDefaultSettings();
  }
}
