import { prisma } from "@/lib/prisma";
import { apiSuccess } from "@/lib/api-utils";

export async function GET() {
  const members = await prisma.boardMember.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      nameAr: true,
      nameEn: true,
      roleAr: true,
      roleEn: true,
      bioAr: true,
      bioEn: true,
      imageUrl: true,
      sortOrder: true,
    },
  });

  return apiSuccess(members);
}
