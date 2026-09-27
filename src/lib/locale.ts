export const LOCALES = ["ar", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export function isLocale(value: string): value is Locale {
  return value === "ar" || value === "en";
}

export function localeFromPath(pathname: string): Locale {
  if (pathname === "/en" || pathname.startsWith("/en/")) return "en";
  return "ar";
}

/** Prefix an internal path with the locale currently shown in the browser URL. */
export function withLocale(href: string, pathname: string): string {
  const locale = localeFromPath(pathname);
  const match = href.match(/^([^?#]*)(.*)$/);
  const path = match?.[1] || "/";
  const suffix = match?.[2] || "";
  const bare = path.startsWith("/") ? path : `/${path}`;
  const localized = locale === "en" ? (bare === "/" ? "/en" : `/en${bare}`) : bare === "/" ? "/ar" : `/ar${bare}`;
  return `${localized}${suffix}`;
}

export function swapLocale(pathname: string, locale: Locale): string {
  const bare = pathname.replace(/^\/(ar|en)(?=\/|$)/, "") || "/";
  const suffix = "";
  if (locale === "en") {
    return `${bare === "/" ? "/en" : `/en${bare}`}${suffix}`;
  }
  return `${bare === "/" ? "/ar" : `/ar${bare}`}${suffix}`;
}

const SITE_ORIGIN = "https://www.syrianyouth.com";

export function localeMetadata(input: {
  locale: string;
  title: string;
  description: string;
  /** Bare path such as "" or "/about". */
  path?: string;
}) {
  const bare = input.path && input.path !== "/" ? input.path : "";
  const ar = `${SITE_ORIGIN}/ar${bare}`;
  const en = `${SITE_ORIGIN}/en${bare}`;
  const canonical = input.locale === "en" ? en : ar;

  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical,
      languages: { ar, en },
    },
  };
}
