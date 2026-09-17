import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiError, apiSuccess } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, { permission: "manage_partners" });
  if (!auth.success) return auth.response;

  const partners = await prisma.partner.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return apiSuccess(partners);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request, { permission: "manage_partners" });
  if (!auth.success) return auth.response;

  try {
    const { name, logoUrl, websiteUrl } = await request.json();
    if (!name) return apiError("اسم الشريك مطلوب.");

    const partner = await prisma.partner.create({
      data: { name, logoUrl: logoUrl || null, websiteUrl: websiteUrl || null },
    });

    return apiSuccess(partner, 201);
  } catch {
    return apiError("فشل إضافة الشريك.", 500);
  }
}
