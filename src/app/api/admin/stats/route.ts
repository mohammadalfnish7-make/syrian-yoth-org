import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiError, apiSuccess } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, { permission: "manage_stats" });
  if (!auth.success) return auth.response;

  const stats = await prisma.impactStat.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return apiSuccess(stats);
}

export async function PUT(request: NextRequest) {
  const auth = await requireAuth(request, { permission: "manage_stats" });
  if (!auth.success) return auth.response;

  try {
    const { stats } = await request.json();
    if (!Array.isArray(stats)) return apiError("بيانات غير صالحة.");

    for (const stat of stats) {
      if (!stat.id) continue;
      await prisma.impactStat.update({
        where: { id: stat.id },
        data: {
          labelAr: stat.labelAr,
          labelEn: stat.labelEn ?? null,
          value: stat.value,
          noteAr: stat.noteAr ?? null,
          noteEn: stat.noteEn ?? null,
          icon: stat.icon || null,
          isActive: stat.isActive ?? true,
        },
      });
    }

    try {
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/", "layout");
      revalidatePath("/ar", "layout");
      revalidatePath("/en", "layout");
    } catch {
      // Cache revalidation is unavailable outside a Next.js request store.
    }

    return apiSuccess({ message: "تم حفظ الإحصائيات." });
  } catch {
    return apiError("فشل حفظ الإحصائيات.", 500);
  }
}
