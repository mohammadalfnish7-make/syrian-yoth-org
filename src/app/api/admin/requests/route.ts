import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiError, apiSuccess } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, { permission: "view_requests" });
  if (!auth.success) return auth.response;

  const govFilter =
    auth.session.role === "GOVERNORATE_ADMIN" && auth.session.governorateId
      ? { governorateId: auth.session.governorateId }
      : {};

  const [volunteer, partner] = await Promise.all([
    prisma.volunteerRequest.findMany({
      where: govFilter,
      include: { governorate: { select: { nameAr: true } } },
      orderBy: { submittedAt: "desc" },
    }),
    prisma.partnerRequest.findMany({
      orderBy: { submittedAt: "desc" },
      ...(auth.session.role === "GOVERNORATE_ADMIN"
        ? { take: 0 }
        : {}),
    }),
  ]);

  return apiSuccess({ volunteer, partner });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAuth(request, { permission: "view_requests" });
  if (!auth.success) return auth.response;

  try {
    const { id, type, status } = await request.json();
    if (!id || !type || !status) {
      return apiError("بيانات غير مكتملة.");
    }

    const validStatuses = ["new", "reviewed", "accepted", "rejected"];
    if (!validStatuses.includes(status)) {
      return apiError("حالة غير صالحة.");
    }

    if (type === "volunteer") {
      const req = await prisma.volunteerRequest.findUnique({ where: { id } });
      if (!req) return apiError("الطلب غير موجود.", 404);

      if (
        auth.session.role === "GOVERNORATE_ADMIN" &&
        req.governorateId !== auth.session.governorateId
      ) {
        return apiError("ليس لديك صلاحية.", 403);
      }

      await prisma.volunteerRequest.update({
        where: { id },
        data: { status },
      });
    } else if (type === "partner") {
      if (auth.session.role !== "SUPER_ADMIN") {
        return apiError("ليس لديك صلاحية.", 403);
      }
      await prisma.partnerRequest.update({
        where: { id },
        data: { status },
      });
    } else {
      return apiError("نوع غير صالح.");
    }

    return apiSuccess({ message: "تم تحديث الحالة." });
  } catch {
    return apiError("فشل التحديث.", 500);
  }
}
