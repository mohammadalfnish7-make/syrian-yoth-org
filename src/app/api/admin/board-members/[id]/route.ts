import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiError, apiSuccess } from "@/lib/api-utils";

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAuth(request, { permission: "manage_board_members" });
  if (!auth.success) return auth.response;

  try {
    const { id } = await params;
    const { nameAr, nameEn, roleAr, roleEn, bioAr, bioEn, imageUrl, sortOrder, isActive } =
      await request.json();

    if (!nameAr?.trim()) return apiError("الاسم بالعربية مطلوب.");
    if (!roleAr?.trim()) return apiError("المنصب بالعربية مطلوب.");

    const member = await prisma.boardMember.update({
      where: { id },
      data: {
        nameAr: nameAr.trim(),
        nameEn: nameEn?.trim() || null,
        roleAr: roleAr.trim(),
        roleEn: roleEn?.trim() || null,
        bioAr: bioAr?.trim() || null,
        bioEn: bioEn?.trim() || null,
        imageUrl: imageUrl || null,
        sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
        isActive: typeof isActive === "boolean" ? isActive : true,
      },
    });

    return apiSuccess(member);
  } catch {
    return apiError("فشل تحديث عضو الإدارة.", 500);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const auth = await requireAuth(_request, { permission: "manage_board_members" });
  if (!auth.success) return auth.response;

  const { id } = await params;
  await prisma.boardMember.delete({ where: { id } });
  return apiSuccess({ message: "تم حذف عضو الإدارة." });
}
