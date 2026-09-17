import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiError, apiSuccess } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, { permission: "manage_board_members" });
  if (!auth.success) return auth.response;

  const members = await prisma.boardMember.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return apiSuccess(members);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request, { permission: "manage_board_members" });
  if (!auth.success) return auth.response;

  try {
    const { nameAr, nameEn, roleAr, roleEn, bioAr, bioEn, imageUrl, sortOrder } =
      await request.json();

    if (!nameAr?.trim()) return apiError("الاسم بالعربية مطلوب.");
    if (!roleAr?.trim()) return apiError("المنصب بالعربية مطلوب.");

    const member = await prisma.boardMember.create({
      data: {
        nameAr: nameAr.trim(),
        nameEn: nameEn?.trim() || null,
        roleAr: roleAr.trim(),
        roleEn: roleEn?.trim() || null,
        bioAr: bioAr?.trim() || null,
        bioEn: bioEn?.trim() || null,
        imageUrl: imageUrl || null,
        sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
      },
    });

    return apiSuccess(member, 201);
  } catch {
    return apiError("فشل إضافة عضو الإدارة.", 500);
  }
}
