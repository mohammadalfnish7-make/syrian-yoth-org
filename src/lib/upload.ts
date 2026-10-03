import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { randomUUID } from "crypto";

export type ImageUploadCategory =
  | "news"
  | "partners"
  | "programs"
  | "events"
  | "focus-areas"
  | "site"
  | "logos"
  | "managers";

export type UploadCategory = ImageUploadCategory | "videos";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_VIDEO_MIME_TYPES = ["video/mp4", "application/mp4"];
const VIDEO_MAX_MB = 40;

const IMAGE_FILENAME_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$/i;

const VIDEO_FILENAME_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.mp4$/i;

const CATEGORY_CONFIG: Record<
  ImageUploadCategory,
  { maxSizeMB: number; maxWidth: number; quality: number }
> = {
  news: { maxSizeMB: 5, maxWidth: 1920, quality: 82 },
  partners: { maxSizeMB: 2, maxWidth: 800, quality: 90 },
  programs: { maxSizeMB: 5, maxWidth: 1920, quality: 82 },
  events: { maxSizeMB: 5, maxWidth: 1920, quality: 82 },
  "focus-areas": { maxSizeMB: 5, maxWidth: 1920, quality: 82 },
  site: { maxSizeMB: 5, maxWidth: 1920, quality: 82 },
  logos: { maxSizeMB: 2, maxWidth: 512, quality: 95 },
  managers: { maxSizeMB: 3, maxWidth: 800, quality: 88 },
};

export const UPLOAD_CATEGORIES = [
  ...(Object.keys(CATEGORY_CONFIG) as ImageUploadCategory[]),
  "videos",
] as UploadCategory[];

export function isUploadCategory(value: string): value is UploadCategory {
  return (UPLOAD_CATEGORIES as string[]).includes(value);
}

export function isImageUploadCategory(
  value: UploadCategory
): value is ImageUploadCategory {
  return value !== "videos";
}

function isAllowedUploadFilename(category: UploadCategory, filename: string) {
  return category === "videos"
    ? VIDEO_FILENAME_PATTERN.test(filename)
    : IMAGE_FILENAME_PATTERN.test(filename);
}

export function contentTypeForUpload(filename: string): string {
  return filename.toLowerCase().endsWith(".mp4") ? "video/mp4" : "image/webp";
}

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

  if (!isAllowedUploadFilename(category, filename)) {
    throw new Error("اسم الملف غير صالح.");
  }

  const base = path.resolve(getCategoryDir(category));
  const filePath = path.resolve(base, filename);

  if (!filePath.startsWith(base + path.sep)) {
    throw new Error("مسار الملف غير صالح.");
  }

  return filePath;
}

function isMp4Buffer(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;
  return buffer.subarray(4, 8).toString("ascii") === "ftyp";
}

export async function processAndSaveVideo(
  file: File
): Promise<{ url: string; filename: string }> {
  const typeAllowed =
    ALLOWED_VIDEO_MIME_TYPES.includes(file.type) ||
    (file.type === "" && file.name.toLowerCase().endsWith(".mp4"));

  if (!typeAllowed) {
    throw new Error("نوع الملف غير مدعوم. يُسمح بملفات MP4 فقط.");
  }

  const maxBytes = VIDEO_MAX_MB * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(`حجم الملف يتجاوز الحد الأقصى (${VIDEO_MAX_MB} ميغابايت).`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!isMp4Buffer(buffer)) {
    throw new Error("محتوى الملف غير صالح.");
  }

  const filename = `${randomUUID()}.mp4`;
  const dir = getCategoryDir("videos");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);

  return {
    url: getPublicUrl("videos", filename),
    filename,
  };
}

export async function processAndSaveImage(
  file: File,
  category: ImageUploadCategory
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
  if (category === "videos" || category in CATEGORY_CONFIG) return category;
  return null;
}
