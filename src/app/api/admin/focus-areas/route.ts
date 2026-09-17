import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiError, apiSuccess } from "@/lib/api-utils";
import { FOCUS_AREA_ICONS } from "@/lib/focus-areas";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, { permission: "manage_focus_areas" });
  if (!auth.success) return auth.response;

  const areas = await prisma.focusArea.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return apiSuccess(areas);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request, { permission: "manage_focus_areas" });
  if (!auth.success) return auth.response;

  try {
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

    const area = await prisma.focusArea.create({
      data: {
        titleAr,
        titleEn: titleEn || null,
        descriptionAr,
        descriptionEn: descriptionEn || null,
        imageUrl: imageUrl || null,
        icon: safeIcon,
        sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
        isActive: isActive !== false,
      },
    });

    return apiSuccess(area, 201);
  } catch {
    return apiError("فشل إضافة المحور.", 500);
  }
}
