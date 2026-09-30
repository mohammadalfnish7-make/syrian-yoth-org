import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiError, apiSuccess } from "@/lib/api-utils";
import { slugify } from "@/lib/program-input";

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function eventData(body: Record<string, unknown>) {
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
    slug: slugify(text(body.slug) || titleEn || `event-${Date.now()}`),
    startsAt: startsAt ? new Date(startsAt) : null,
    isRolling: Boolean(body.isRolling),
    registerPath: text(body.registerPath) ?? "/get-involved",
    imageUrl: text(body.imageUrl),
    isActive: body.isActive !== false,
  };
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, { permission: "manage_programs" });
  if (!auth.success) return auth.response;

  const events = await prisma.event.findMany({ orderBy: { sortOrder: "asc" } });
  return apiSuccess(events);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request, { permission: "manage_programs" });
  if (!auth.success) return auth.response;

  try {
    const data = eventData(await request.json());
    if (!data.titleAr || !data.descriptionAr) {
      return apiError("العنوان والوصف مطلوبان.");
    }
    const event = await prisma.event.create({ data });
    return apiSuccess(event, 201);
  } catch {
    return apiError("فشل إضافة الفعالية.", 500);
  }
}
