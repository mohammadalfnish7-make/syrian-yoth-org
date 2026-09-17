import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiError, apiSuccess } from "@/lib/api-utils";
import { getDefaultWhatWeDoSection } from "@/lib/focus-areas";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, { permission: "manage_focus_areas" });
  if (!auth.success) return auth.response;

  const setting = await prisma.siteSetting.findUnique({
    where: { key: "what_we_do" },
  });

  const defaults = getDefaultWhatWeDoSection();
  if (!setting?.value || typeof setting.value !== "object") {
    return apiSuccess(defaults);
  }

  const v = setting.value as Partial<typeof defaults>;
  return apiSuccess({
    labelAr: v.labelAr ?? defaults.labelAr,
    labelEn: v.labelEn ?? defaults.labelEn,
    titleAr: v.titleAr ?? defaults.titleAr,
    titleEn: v.titleEn ?? defaults.titleEn,
    descAr: v.descAr ?? defaults.descAr,
    descEn: v.descEn ?? defaults.descEn,
  });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAuth(request, { permission: "manage_focus_areas" });
  if (!auth.success) return auth.response;

  try {
    const body = await request.json();
    const { labelAr, labelEn, titleAr, titleEn, descAr, descEn } = body;

    if (!labelAr || !titleAr || !descAr) {
      return apiError("حقول العناوين العربية مطلوبة.");
    }

    const value = {
      labelAr,
      labelEn: labelEn || labelAr,
      titleAr,
      titleEn: titleEn || titleAr,
      descAr,
      descEn: descEn || descAr,
    };

    await prisma.siteSetting.upsert({
      where: { key: "what_we_do" },
      update: { value },
      create: { key: "what_we_do", value },
    });

    return apiSuccess(value);
  } catch {
    return apiError("فشل حفظ إعدادات القسم.", 500);
  }
}
