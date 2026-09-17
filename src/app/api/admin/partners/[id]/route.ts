import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiSuccess } from "@/lib/api-utils";

type RouteParams = { params: Promise<{ id: string }> };

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const auth = await requireAuth(_request, { permission: "manage_partners" });
  if (!auth.success) return auth.response;

  const { id } = await params;
  await prisma.partner.delete({ where: { id } });
  return apiSuccess({ message: "تم حذف الشريك." });
}
