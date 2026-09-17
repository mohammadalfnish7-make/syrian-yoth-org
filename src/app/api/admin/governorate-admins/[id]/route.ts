import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiError, apiSuccess } from "@/lib/api-utils";

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAuth(request, { permission: "manage_admins" });
  if (!auth.success) return auth.response;

  const { id } = await params;

  try {
    const body = await request.json();
    const { password, governorateId, isActive } = body;

    const admin = await prisma.admin.findUnique({ where: { id } });
    if (!admin || admin.role !== "GOVERNORATE_ADMIN") {
      return apiError("الحساب غير موجود.", 404);
    }

    const data: {
      passwordHash?: string;
      governorateId?: string;
      isActive?: boolean;
    } = {};

    if (password) {
      if (password.length < 8) {
        return apiError("كلمة المرور يجب أن تكون 8 أحرف على الأقل.");
      }
      data.passwordHash = await bcrypt.hash(password, 12);
    }

    if (governorateId) {
      const governorate = await prisma.governorate.findUnique({
        where: { id: governorateId },
      });
      if (!governorate) return apiError("المحافظة غير موجودة.");
      data.governorateId = governorateId;
    }

    if (typeof isActive === "boolean") {
      data.isActive = isActive;
    }

    const updated = await prisma.admin.update({
      where: { id },
      data,
      include: { governorate: { select: { id: true, nameAr: true } } },
    });

    await prisma.auditLog.create({
      data: {
        adminId: auth.session.sub,
        action: "update",
        entityType: "admin",
        entityId: id,
        details: { fields: Object.keys(data) },
      },
    });

    const { passwordHash: _hash, ...result } = updated;
    void _hash;
    return apiSuccess(result);
  } catch {
    return apiError("فشل تحديث الحساب.", 500);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAuth(request, { permission: "manage_admins" });
  if (!auth.success) return auth.response;

  const { id } = await params;

  if (id === auth.session.sub) {
    return apiError("لا يمكنك حذف حسابك.", 400);
  }

  try {
    const admin = await prisma.admin.findUnique({ where: { id } });
    if (!admin || admin.role !== "GOVERNORATE_ADMIN") {
      return apiError("الحساب غير موجود.", 404);
    }

    await prisma.admin.update({
      where: { id },
      data: { isActive: false },
    });

    await prisma.auditLog.create({
      data: {
        adminId: auth.session.sub,
        action: "deactivate",
        entityType: "admin",
        entityId: id,
      },
    });

    return apiSuccess({ message: "تم تعطيل الحساب." });
  } catch {
    return apiError("فشل تعطيل الحساب.", 500);
  }
}
