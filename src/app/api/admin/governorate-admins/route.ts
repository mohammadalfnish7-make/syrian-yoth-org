import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiError, apiSuccess } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, { permission: "manage_admins" });
  if (!auth.success) return auth.response;

  const admins = await prisma.admin.findMany({
    where: { role: "GOVERNORATE_ADMIN" },
    include: {
      governorate: { select: { id: true, nameAr: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess(
    admins.map(({ passwordHash, ...admin }) => admin)
  );
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request, { permission: "manage_admins" });
  if (!auth.success) return auth.response;

  try {
    const body = await request.json();
    const rawUsername =
      typeof body.username === "string" ? body.username.trim() : "";
    const rawPassword =
      typeof body.password === "string" ? body.password : "";
    const rawGovId =
      typeof body.governorateId === "string" ? body.governorateId.trim() : "";

    if (!rawUsername || !rawPassword || !rawGovId) {
      return apiError("اسم المستخدم وكلمة المرور والمحافظة مطلوبة.");
    }

    if (rawPassword.length < 8) {
      return apiError("كلمة المرور يجب أن تكون 8 أحرف على الأقل.");
    }

    const existing = await prisma.admin.findFirst({
      where: {
        username: {
          equals: rawUsername,
          mode: "insensitive",
        },
      },
    });
    if (existing) {
      return apiError("اسم المستخدم مستخدم مسبقاً.");
    }

    const governorate = await prisma.governorate.findUnique({
      where: { id: rawGovId },
    });
    if (!governorate) {
      return apiError("المحافظة غير موجودة.");
    }

    const passwordHash = await bcrypt.hash(rawPassword, 12);

    const admin = await prisma.admin.create({
      data: {
        username: rawUsername.toLowerCase(),
        passwordHash,
        role: "GOVERNORATE_ADMIN",
        governorateId: rawGovId,
      },
      include: {
        governorate: { select: { id: true, nameAr: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        adminId: auth.session.sub,
        action: "create",
        entityType: "admin",
        entityId: admin.id,
        details: { username, governorateId },
      },
    });

    const { passwordHash: _hash, ...result } = admin;
    void _hash;
    return apiSuccess(result, 201);
  } catch {
    return apiError("فشل إنشاء الحساب.", 500);
  }
}
