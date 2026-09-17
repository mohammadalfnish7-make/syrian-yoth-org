import { prisma } from "@/lib/prisma";
import { apiSuccess } from "@/lib/api-utils";

export async function GET() {
  const partners = await prisma.partner.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return apiSuccess(partners);
}
