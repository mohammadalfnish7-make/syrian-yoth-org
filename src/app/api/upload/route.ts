import { NextRequest } from "next/server";
import {
  requireAuth,
  apiError,
  apiSuccess,
  readJsonBodyLimit,
} from "@/lib/api-utils";
import {
  processAndSaveImage,
  deleteImage,
  extractFilenameFromUrl,
  extractCategoryFromUrl,
  type UploadCategory,
} from "@/lib/upload";
import { getUploadCategoryPermission, hasPermission } from "@/lib/rbac";

const VALID_CATEGORIES: UploadCategory[] = [
  "news",
  "partners",
  "programs",
  "site",
  "logos",
  "managers",
];

function canUploadCategory(
  role: Parameters<typeof hasPermission>[0],
  category: UploadCategory
): boolean {
  return hasPermission(role, getUploadCategoryPermission(category));
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.success) return auth.response;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const category = formData.get("category") as string | null;

    if (!file) {
      return apiError("لم يتم إرفاق ملف.");
    }

    if (!category || !VALID_CATEGORIES.includes(category as UploadCategory)) {
      return apiError("فئة الرفع غير صالحة.");
    }

    const uploadCategory = category as UploadCategory;
    if (!canUploadCategory(auth.session.role, uploadCategory)) {
      return apiError("ليس لديك صلاحية لهذا الإجراء.", 403);
    }

    const result = await processAndSaveImage(file, uploadCategory);

    return apiSuccess({
      url: result.url,
      filename: result.filename,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "فشل رفع الملف.";
    return apiError(message, 400);
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.success) return auth.response;

  try {
    const sizeCheck = readJsonBodyLimit(request, 4 * 1024);
    if (sizeCheck.tooLarge) {
      return apiError("حجم الطلب كبير جداً.", 413);
    }

    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return apiError("رابط الملف مطلوب.");
    }

    const category = extractCategoryFromUrl(url);
    const filename = extractFilenameFromUrl(url);

    if (!category || !filename) {
      return apiError("رابط الملف غير صالح.");
    }

    if (!canUploadCategory(auth.session.role, category)) {
      return apiError("ليس لديك صلاحية لهذا الإجراء.", 403);
    }

    await deleteImage(category, filename);
    return apiSuccess({ message: "تم حذف الملف." });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "فشل حذف الملف.";
    return apiError(message, 400);
  }
}
