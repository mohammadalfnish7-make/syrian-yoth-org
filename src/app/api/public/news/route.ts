import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const governorateId = searchParams.get("governorate_id");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = 12;

  const where = {
    status: "published" as const,
    ...(governorateId ? { governorateId } : {}),
  };

  const [news, total] = await Promise.all([
    prisma.news.findMany({
      where,
      include: { governorate: { select: { nameAr: true, nameEn: true } } },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.news.count({ where }),
  ]);

  return apiSuccess({
    news,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
