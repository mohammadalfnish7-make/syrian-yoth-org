import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiError, apiSuccess } from "@/lib/api-utils";
import { programData } from "@/lib/program-input";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAuth(request, { permission: "manage_programs" });
  if (!auth.success) return auth.response;

  const { id } = await params;
  const data = programData(await request.json());
  if (!data.title || !data.description) {
    return apiError("العنوان والوصف مطلوبان.");
  }

  try {
    const program = await prisma.program.update({ where: { id }, data });
    return apiSuccess(program);
  } catch {
    return apiError("تعذر حفظ البرنامج. تأكد أن مسار الرابط غير مستخدم.", 500);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const auth = await requireAuth(_request, { permission: "manage_programs" });
  if (!auth.success) return auth.response;

  const { id } = await params;
  await prisma.program.delete({ where: { id } });
  return apiSuccess({ message: "تم حذف البرنامج." });
}
