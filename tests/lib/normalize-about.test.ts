import { describe, it, expect } from "vitest";
import { normalizeAboutSettings } from "@/lib/normalize-about";
import type { AboutSettings } from "@/types/site";

const defaults: AboutSettings = {
  mission: { ar: "مهمة", en: "Mission" },
  vision: { ar: "رؤية", en: "Vision" },
  values: [
    { ar: "الكرامة", en: "Dignity" },
    { ar: "التكافل", en: "Solidarity" },
  ],
};

describe("normalizeAboutSettings", () => {
  it("returns defaults for invalid input", () => {
    expect(normalizeAboutSettings(null, defaults)).toEqual(defaults);
  });

  it("normalizes legacy string fields from the database", () => {
    const result = normalizeAboutSettings(
      {
        mission: "مهمة قديمة",
        vision: "رؤية قديمة",
        values: ["الكرامة", "التكافل"],
      },
      defaults
    );

    expect(result.mission).toEqual({ ar: "مهمة قديمة", en: "Mission" });
    expect(result.vision).toEqual({ ar: "رؤية قديمة", en: "Vision" });
    expect(result.values).toEqual([
      { ar: "الكرامة", en: "Dignity" },
      { ar: "التكافل", en: "Solidarity" },
    ]);
  });

  it("preserves bilingual fields when present", () => {
    const result = normalizeAboutSettings(
      {
        mission: { ar: "مهمة", en: "Our mission" },
        vision: { ar: "رؤية", en: "Our vision" },
        values: [{ ar: "العدل", en: "Justice" }],
      },
      defaults
    );

    expect(result.mission.en).toBe("Our mission");
    expect(result.vision.en).toBe("Our vision");
    expect(result.values[0]).toEqual({ ar: "العدل", en: "Justice" });
  });
});
