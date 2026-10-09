import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiError, apiSuccess } from "@/lib/api-utils";
import { eventInput } from "@/lib/event-input";

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
    const data = eventInput(await request.json());
    if (!data.titleAr || !data.descriptionAr) {
      return apiError("العنوان والوصف مطلوبان.");
    }
    const event = await prisma.event.create({ data });
    return apiSuccess(event, 201);
  } catch {
    return apiError("فشل إضافة الفعالية.", 500);
  }
}
