import type { AboutSettings, BilingualText } from "@/types/site";

function isBilingualText(value: unknown): value is BilingualText {
  return (
    typeof value === "object" &&
    value !== null &&
    "ar" in value &&
    "en" in value &&
    typeof (value as BilingualText).ar === "string" &&
    typeof (value as BilingualText).en === "string"
  );
}

function renameLegacyValue(value: BilingualText): BilingualText {
  if (value.ar !== "الإحسان" && value.ar !== "الاحسان") return value;
  return {
    ar: "الإتقان",
    en: value.en === "Excellence" || value.en === "الإحسان" ? "Mastery" : value.en || "Mastery",
  };
}

function normalizeBilingualValue(
  value: unknown,
  fallback: BilingualText
): BilingualText {
  if (typeof value === "string") {
    return { ar: value, en: fallback.en };
  }
  if (isBilingualText(value)) {
    return { ar: value.ar, en: value.en };
  }
  return fallback;
}

/** Supports legacy DB rows where mission/vision were plain strings and values were string[]. */
export function normalizeAboutSettings(
  raw: unknown,
  defaults: AboutSettings
): AboutSettings {
  if (!raw || typeof raw !== "object") {
    return defaults;
  }

  const data = raw as Record<string, unknown>;

  const mission = normalizeBilingualValue(data.mission, defaults.mission);
  const vision = normalizeBilingualValue(data.vision, defaults.vision);

  const values = Array.isArray(data.values)
    ? data.values.map((value, index) =>
        renameLegacyValue(
          normalizeBilingualValue(value, defaults.values[index] ?? { ar: "", en: "" })
        )
      )
    : defaults.values;

  const yearsOfExperience =
    typeof data.yearsOfExperience === "string"
      ? data.yearsOfExperience
      : defaults.yearsOfExperience;

  const label = normalizeBilingualValue(data.label, defaults.label);
  const title = normalizeBilingualValue(data.title, defaults.title);
  const presenceLabel = normalizeBilingualValue(
    data.presenceLabel,
    defaults.presenceLabel
  );

  return { label, title, mission, vision, presenceLabel, values, yearsOfExperience };
}
