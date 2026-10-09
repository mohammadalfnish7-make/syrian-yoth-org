import { slugify } from "@/lib/program-input";

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function eventFields(body: Record<string, unknown>) {
  const titleAr = text(body.titleAr) ?? "";
  const descriptionAr = text(body.descriptionAr) ?? "";
  const titleEn = text(body.titleEn);
  const startsAt = text(body.startsAt);

  return {
    titleAr,
    titleEn,
    descriptionAr,
    descriptionEn: text(body.descriptionEn),
    cityAr: text(body.cityAr) ?? "دمشق",
    cityEn: text(body.cityEn),
    startsAt: startsAt ? new Date(startsAt) : null,
    isRolling: Boolean(body.isRolling),
    registerPath: text(body.registerPath) ?? "/get-involved",
    imageUrl: text(body.imageUrl),
    isActive: body.isActive !== false,
  };
}

export function eventInput(body: Record<string, unknown>) {
  const data = eventFields(body);
  return {
    ...data,
    slug: slugify(text(body.slug) || data.titleEn || `event-${Date.now()}`),
  };
}

export function eventUpdateInput(body: Record<string, unknown>) {
  return eventFields(body);
}
