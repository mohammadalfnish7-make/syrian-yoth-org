export type GovernorateRegion = "north" | "central" | "coast" | "south" | "east";

export const REGION_ORDER: GovernorateRegion[] = [
  "north",
  "central",
  "coast",
  "south",
  "east",
];

export const REGION_LABELS: Record<
  GovernorateRegion,
  { ar: string; en: string }
> = {
  north: { ar: "الشمال", en: "North" },
  central: { ar: "الوسط", en: "Central" },
  coast: { ar: "الساحل", en: "Coast" },
  south: { ar: "الجنوب", en: "South" },
  east: { ar: "الشرق", en: "East" },
};

const REGION_BY_NAME_EN: Record<string, GovernorateRegion> = {
  Aleppo: "north",
  Idlib: "north",
  Homs: "central",
  Hama: "central",
  Latakia: "coast",
  Tartus: "coast",
  Damascus: "south",
  "Rif Dimashq": "south",
  "As-Suwayda": "south",
  Daraa: "south",
  Quneitra: "south",
  Raqqa: "east",
  "Deir ez-Zor": "east",
  "Al-Hasakah": "east",
};

const REGION_BY_NAME_AR: Record<string, GovernorateRegion> = {
  حلب: "north",
  إدلب: "north",
  حمص: "central",
  حماة: "central",
  اللاذقية: "coast",
  طرطوس: "coast",
  دمشق: "south",
  "ريف دمشق": "south",
  السويداء: "south",
  درعا: "south",
  القنيطرة: "south",
  الرقة: "east",
  "دير الزور": "east",
  الحسكة: "east",
};

export function getGovernorateRegion(gov: {
  nameAr: string;
  nameEn: string | null;
}): GovernorateRegion {
  if (gov.nameEn && REGION_BY_NAME_EN[gov.nameEn]) {
    return REGION_BY_NAME_EN[gov.nameEn];
  }
  return REGION_BY_NAME_AR[gov.nameAr] ?? "central";
}
