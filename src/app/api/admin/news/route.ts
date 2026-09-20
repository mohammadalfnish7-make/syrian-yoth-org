import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiError, apiSuccess } from "@/lib/api-utils";
import { revalidatePublicNews } from "@/lib/revalidate-public";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, { permission: "manage_news" });
  if (!auth.success) return auth.response;

  const where =
    auth.session.role === "GOVERNORATE_ADMIN" && auth.session.governorateId
      ? { governorateId: auth.session.governorateId }
      : {};

  const news = await prisma.news.findMany({
    where,
    include: {
      governorate: { select: { nameAr: true, nameEn: true } },
      author: { select: { username: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess(news);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request, { permission: "manage_news" });
  if (!auth.success) return auth.response;

  try {
    const body = await request.json();
    const { title, titleEn, body: content, bodyEn, coverImageUrl, status } = body;

    if (!title || !content) {
      return apiError("العنوان والمحتوى مطلوبان.");
    }

    let governorateId = body.governorateId;
    if (auth.session.role === "GOVERNORATE_ADMIN") {
      governorateId = auth.session.governorateId;
    }
    if (!governorateId) {
      return apiError("المحافظة مطلوبة.");
    }

    const news = await prisma.news.create({
      data: {
        title,
        titleEn: titleEn || null,
        body: content,
        bodyEn: bodyEn || null,
        coverImageUrl: coverImageUrl || null,
        status: status || "draft",
        governorateId,
        authorId: auth.session.sub,
        publishedAt: status === "published" ? new Date() : null,
      },
      include: { governorate: { select: { nameAr: true, nameEn: true } } },
    });

    if (news.status === "published") {
      revalidatePublicNews();
    }

    return apiSuccess(news, 201);
  } catch {
    return apiError("فشل إنشاء الخبر.", 500);
  }
}
