import { prisma } from "@/lib/prisma";
import { apiSuccess } from "@/lib/api-utils";

export async function GET() {
  const stats = await prisma.impactStat.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return apiSuccess(stats);
}
