import { mkdir, readFile, unlink } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { randomUUID } from "crypto";

export type UploadCategory =
  | "news"
  | "partners"
  | "programs"
  | "focus-areas"
  | "site"
  | "logos"
  | "managers";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

const UPLOAD_FILENAME_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$/i;

const CATEGORY_CONFIG: Record<
  UploadCategory,
  { maxSizeMB: number; maxWidth: number; quality: number }
> = {
  news: { maxSizeMB: 5, maxWidth: 1920, quality: 82 },
  partners: { maxSizeMB: 2, maxWidth: 800, quality: 90 },
  programs: { maxSizeMB: 5, maxWidth: 1920, quality: 82 },
  "focus-areas": { maxSizeMB: 5, maxWidth: 1920, quality: 82 },
  site: { maxSizeMB: 5, maxWidth: 1920, quality: 82 },
  logos: { maxSizeMB: 2, maxWidth: 512, quality: 95 },
  managers: { maxSizeMB: 3, maxWidth: 800, quality: 88 },
};

function getUploadDir(): string {
  return process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
}

export function getPublicUrl(category: UploadCategory, filename: string): string {
  return `/api/uploads/${category}/${filename}`;
}

function getCategoryDir(category: UploadCategory): string {
  return path.join(getUploadDir(), category);
}

function getLegacyManagerPublicPath(filename: string): string {
  return path.join(process.cwd(), "public", "images", "managers", filename);
}

export function resolveUploadPath(
  category: UploadCategory,
  filename: string
): string {
  if (
    filename.includes("..") ||
    filename.includes("/") ||
    filename.includes("\\")
  ) {
    throw new Error("اسم الملف غير صالح.");
  }

  if (!UPLOAD_FILENAME_PATTERN.test(filename)) {
    throw new Error("اسم الملف غير صالح.");
  }

  const base = path.resolve(getCategoryDir(category));
  const filePath = path.resolve(base, filename);

  if (!filePath.startsWith(base + path.sep)) {
    throw new Error("مسار الملف غير صالح.");
  }

  return filePath;
}

export async function processAndSaveImage(
  file: File,
  category: UploadCategory
): Promise<{ url: string; filename: string }> {
  const config = CATEGORY_CONFIG[category];

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error("نوع الملف غير مدعوم. يُسمح بـ JPEG و PNG و WebP فقط.");
  }

  const maxBytes = config.maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(`حجم الملف يتجاوز الحد الأقصى (${config.maxSizeMB} ميغابايت).`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const metadata = await sharp(buffer).metadata();
  if (!metadata.format || !["jpeg", "png", "webp"].includes(metadata.format)) {
    throw new Error("محتوى الملف غير صالح.");
  }

  const filename = `${randomUUID()}.webp`;
  const dir = getCategoryDir(category);
  await mkdir(dir, { recursive: true });

  const outputPath = path.join(dir, filename);

  await sharp(buffer)
    .resize({ width: config.maxWidth, withoutEnlargement: true })
    .webp({ quality: config.quality })
    .toFile(outputPath);

  return {
    url: getPublicUrl(category, filename),
    filename,
  };
}

export async function deleteImage(
  category: UploadCategory,
  filename: string
): Promise<void> {
  const paths = [resolveUploadPath(category, filename)];
  if (category === "managers") {
    paths.push(getLegacyManagerPublicPath(filename));
  }

  for (const filePath of paths) {
    try {
      await unlink(filePath);
    } catch {
      // File may already be deleted
    }
  }
}

export async function readManagerImage(filename: string): Promise<Buffer> {
  try {
    return await readFile(resolveUploadPath("managers", filename));
  } catch {
    return await readFile(getLegacyManagerPublicPath(filename));
  }
}

export function extractFilenameFromUrl(url: string): string | null {
  const apiMatch = url.match(/\/api\/uploads\/[^/]+\/(.+)$/);
  if (apiMatch) return apiMatch[1];
  const managersMatch = url.match(/\/images\/managers\/(.+)$/);
  return managersMatch ? managersMatch[1] : null;
}

export function extractCategoryFromUrl(url: string): UploadCategory | null {
  if (url.includes("/images/managers/")) return "managers";
  const match = url.match(/\/api\/uploads\/([^/]+)\//);
  if (!match) return null;
  const category = match[1] as UploadCategory;
  if (category in CATEGORY_CONFIG) return category;
  return null;
}
