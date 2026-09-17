export type BrandingSettings = {
  logoUrl: string | null;
  logoMarkUrl: string | null;
  faviconUrl: string | null;
};

export type HeroSettings = {
  title: string;
  subtitle: string;
  tagline: string;
  imageUrl: string | null;
};

export type ContactSettings = {
  email: string;
  phone: string;
  address: string;
  website: string;
};

export type SocialLinksSettings = {
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
  linkedin: string;
};

export type BilingualText = {
  ar: string;
  en: string;
};

export type AboutSettings = {
  mission: BilingualText;
  vision: BilingualText;
  values: BilingualText[];
};

export type PublicSettings = {
  contact: ContactSettings;
  social_links: SocialLinksSettings;
  hero: HeroSettings;
  about: AboutSettings;
  branding: BrandingSettings;
};
