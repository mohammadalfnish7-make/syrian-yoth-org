function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function slugify(value: string) {
  const base = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || `item-${Date.now()}`;
}

export function programData(body: Record<string, unknown>) {
  const title = text(body.title) ?? "";
  const description = text(body.description) ?? "";
  const titleEn = text(body.titleEn);
  const slugSource = text(body.slug) || titleEn || "";

  return {
    title,
    description,
    titleEn,
    descriptionEn: text(body.descriptionEn),
    slug: slugSource ? slugify(slugSource) : null,
    audienceAr: text(body.audienceAr),
    audienceEn: text(body.audienceEn),
    scheduleAr: text(body.scheduleAr),
    scheduleEn: text(body.scheduleEn),
    whereAr: text(body.whereAr),
    whereEn: text(body.whereEn),
    outcomesAr: text(body.outcomesAr),
    outcomesEn: text(body.outcomesEn),
    imageUrl: text(body.imageUrl),
  };
}
