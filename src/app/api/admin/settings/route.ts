import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireAuth,
  apiError,
  apiSuccess,
  readJsonBodyLimit,
} from "@/lib/api-utils";
import { adminSettingsSchema } from "@/lib/settings-validation";

const SETTING_KEYS = ["contact", "social_links", "hero", "about", "branding"];

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, { permission: "manage_site_settings" });
  if (!auth.success) return auth.response;

  const settings = await prisma.siteSetting.findMany({
    where: { key: { in: SETTING_KEYS } },
  });

  const result: Record<string, unknown> = {};
  for (const s of settings) {
    result[s.key] = s.value;
  }

  return apiSuccess(result);
}

export async function PUT(request: NextRequest) {
  const auth = await requireAuth(request, { permission: "manage_site_settings" });
  if (!auth.success) return auth.response;

  try {
    const sizeCheck = readJsonBodyLimit(request, 256 * 1024);
    if (sizeCheck.tooLarge) {
      return apiError("حجم الطلب كبير جداً.", 413);
    }

    const body = await request.json();
    const parsed = adminSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("بيانات الإعدادات غير صالحة.", 400);
    }

    const validated = parsed.data;

    for (const key of SETTING_KEYS) {
      const value = validated[key as keyof typeof validated];
      if (value !== undefined) {
        await prisma.siteSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        });
      }
    }

    await prisma.auditLog.create({
      data: {
        adminId: auth.session.sub,
        action: "update",
        entityType: "site_settings",
        details: { keys: Object.keys(validated) },
      },
    });

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/", "layout");

    return apiSuccess({ message: "تم حفظ الإعدادات." });
  } catch {
    return apiError("فشل حفظ الإعدادات.", 500);
  }
}
