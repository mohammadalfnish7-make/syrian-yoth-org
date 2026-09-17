import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiError, apiSuccess } from "@/lib/api-utils";
import { FOCUS_AREA_ICONS } from "@/lib/focus-areas";

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAuth(request, { permission: "manage_focus_areas" });
  if (!auth.success) return auth.response;

  try {
    const { id } = await params;
    const body = await request.json();
    const {
      titleAr,
      titleEn,
      descriptionAr,
      descriptionEn,
      imageUrl,
      icon,
      sortOrder,
      isActive,
    } = body;

    if (!titleAr || !descriptionAr) {
      return apiError("العنوان والوصف بالعربية مطلوبان.");
    }

    const safeIcon = FOCUS_AREA_ICONS.includes(icon) ? icon : "leadership";

    const area = await prisma.focusArea.update({
      where: { id },
      data: {
        titleAr,
        titleEn: titleEn || null,
        descriptionAr,
        descriptionEn: descriptionEn || null,
        imageUrl: imageUrl ?? null,
        icon: safeIcon,
        sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
        isActive: isActive !== false,
      },
    });

    return apiSuccess(area);
  } catch {
    return apiError("فشل تحديث المحور.", 500);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const auth = await requireAuth(_request, {
    permission: "manage_focus_areas",
  });
  if (!auth.success) return auth.response;

  const { id } = await params;
  await prisma.focusArea.delete({ where: { id } });
  return apiSuccess({ message: "تم حذف المحور." });
}
