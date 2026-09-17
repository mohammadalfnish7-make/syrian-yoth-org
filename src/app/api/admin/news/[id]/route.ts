import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiError, apiSuccess } from "@/lib/api-utils";
import { revalidatePublicNews } from "@/lib/revalidate-public";

type RouteParams = { params: Promise<{ id: string }> };

async function getAuthorizedNews(id: string, session: NonNullable<Awaited<ReturnType<typeof import("@/lib/auth").getVerifiedSession>>>) {
  const news = await prisma.news.findUnique({ where: { id } });
  if (!news) return null;

  if (
    session.role === "GOVERNORATE_ADMIN" &&
    news.governorateId !== session.governorateId
  ) {
    return null;
  }

  return news;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAuth(request, { permission: "manage_news" });
  if (!auth.success) return auth.response;

  const { id } = await params;

  try {
    const existing = await getAuthorizedNews(id, auth.session);
    if (!existing) return apiError("الخبر غير موجود.", 404);

    const body = await request.json();
    const { title, body: content, coverImageUrl, status } = body;

    const news = await prisma.news.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content && { body: content }),
        ...(coverImageUrl !== undefined && { coverImageUrl }),
        ...(status && {
          status,
          publishedAt:
            status === "published" && !existing.publishedAt
              ? new Date()
              : existing.publishedAt,
        }),
      },
    });

    if (
      (status && status !== existing.status) ||
      existing.status === "published" ||
      news.status === "published"
    ) {
      revalidatePublicNews();
    }

    return apiSuccess(news);
  } catch {
    return apiError("فشل تحديث الخبر.", 500);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAuth(request, { permission: "manage_news" });
  if (!auth.success) return auth.response;

  const { id } = await params;

  const existing = await getAuthorizedNews(id, auth.session);
  if (!existing) return apiError("الخبر غير موجود.", 404);

  await prisma.news.delete({ where: { id } });
  revalidatePublicNews();
  return apiSuccess({ message: "تم حذف الخبر." });
}
