"use client";

import { useEffect } from "react";
import type { Locale } from "@/lib/locale";

export function LocaleSync({ locale }: { locale: Locale }) {
  useEffect(() => {
    const input = document.getElementById(
      locale === "en" ? "lang-en" : "lang-ar"
    ) as HTMLInputElement | null;
    if (input) input.checked = true;
    document.documentElement.lang = locale === "en" ? "en" : "ar";
    document.documentElement.dir = locale === "en" ? "ltr" : "rtl";
  }, [locale]);

  return null;
}
