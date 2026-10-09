import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiError, apiSuccess } from "@/lib/api-utils";
import { eventUpdateInput } from "@/lib/event-input";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAuth(request, { permission: "manage_programs" });
  if (!auth.success) return auth.response;

  const { id } = await params;

  try {
    const data = eventUpdateInput(await request.json());
    if (!data.titleAr || !data.descriptionAr) {
      return apiError("العنوان والوصف مطلوبان.");
    }
    const event = await prisma.event.update({ where: { id }, data });
    return apiSuccess(event);
  } catch {
    return apiError("تعذر حفظ الفعالية.", 500);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const auth = await requireAuth(_request, { permission: "manage_programs" });
  if (!auth.success) return auth.response;

  const { id } = await params;
  await prisma.event.delete({ where: { id } });
  return apiSuccess({ message: "تم حذف الفعالية." });
}
