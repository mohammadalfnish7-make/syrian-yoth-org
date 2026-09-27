"use client";

import { usePathname, useRouter } from "next/navigation";
import { swapLocale, type Locale } from "@/lib/locale";

export function LangSwitch() {
  const pathname = usePathname() || "/ar";
  const router = useRouter();

  function go(locale: Locale) {
    const next = swapLocale(pathname, locale);
    if (next !== pathname) router.push(next);
  }

  return (
    <div className="lang-switch" role="group" aria-label="Language">
      <label
        htmlFor="lang-ar"
        id="lang-ar-label"
        className="lang-switch__btn"
        onClick={() => go("ar")}
      >
        AR
      </label>
      <label
        htmlFor="lang-en"
        id="lang-en-label"
        className="lang-switch__btn"
        onClick={() => go("en")}
      >
        EN
      </label>
    </div>
  );
}
