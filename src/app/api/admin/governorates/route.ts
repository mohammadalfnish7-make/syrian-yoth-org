import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getVerifiedSession } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { apiSuccess } from "@/lib/api-utils";

export async function GET() {
  const session = await getVerifiedSession();

  if (!session) {
    return NextResponse.json(
      { error: "غير مصرح. يرجى تسجيل الدخول." },
      { status: 401 }
    );
  }

  const canList =
    hasPermission(session.role, "manage_admins") ||
    hasPermission(session.role, "manage_news");

  if (!canList) {
    return NextResponse.json(
      { error: "ليس لديك صلاحية لهذا الإجراء." },
      { status: 403 }
    );
  }

  const where =
    session.role === "GOVERNORATE_ADMIN" && session.governorateId
      ? { id: session.governorateId, isActive: true }
      : { isActive: true };

  const governorates = await prisma.governorate.findMany({
    where,
    orderBy: { sortOrder: "asc" },
    select: { id: true, nameAr: true, nameEn: true },
  });

  return apiSuccess(governorates);
}
