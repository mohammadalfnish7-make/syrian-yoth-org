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
  | "managers"
  | "volunteers";

export type DocumentUploadCategory = "volunteer-docs";

export type UploadCategory =
  | ImageUploadCategory
  | DocumentUploadCategory
  | "videos";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_VIDEO_MIME_TYPES = ["video/mp4", "application/mp4"];
const ALLOWED_DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const VIDEO_MAX_MB = 40;
const DOCUMENT_MAX_MB = 10;

const IMAGE_FILENAME_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$/i;

const VIDEO_FILENAME_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.mp4$/i;

const DOCUMENT_FILENAME_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(pdf|doc|docx)$/i;

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
  volunteers: { maxSizeMB: 5, maxWidth: 1920, quality: 85 },
};

export const UPLOAD_CATEGORIES = [
  ...(Object.keys(CATEGORY_CONFIG) as ImageUploadCategory[]),
  "volunteer-docs",
  "videos",
] as UploadCategory[];

export function isUploadCategory(value: string): value is UploadCategory {
  return (UPLOAD_CATEGORIES as string[]).includes(value);
}

export function isImageUploadCategory(
  value: UploadCategory
): value is ImageUploadCategory {
  return value !== "videos" && value !== "volunteer-docs";
}

export function isDocumentUploadCategory(
  value: UploadCategory
): value is DocumentUploadCategory {
  return value === "volunteer-docs";
}

function isAllowedUploadFilename(category: UploadCategory, filename: string) {
  if (category === "videos") return VIDEO_FILENAME_PATTERN.test(filename);
  if (category === "volunteer-docs") {
    return DOCUMENT_FILENAME_PATTERN.test(filename);
  }
  return IMAGE_FILENAME_PATTERN.test(filename);
}

export function contentTypeForUpload(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".mp4")) return "video/mp4";
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".doc")) return "application/msword";
  if (lower.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  return "image/webp";
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

function documentExtension(file: File): "pdf" | "doc" | "docx" | null {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf") || file.type === "application/pdf") return "pdf";
  if (name.endsWith(".docx") || file.type.includes("wordprocessingml")) {
    return "docx";
  }
  if (name.endsWith(".doc") || file.type === "application/msword") return "doc";
  return null;
}

function isPdfBuffer(buffer: Buffer): boolean {
  return buffer.length >= 5 && buffer.subarray(0, 5).toString("ascii") === "%PDF-";
}

function isZipBuffer(buffer: Buffer): boolean {
  return (
    buffer.length >= 4 &&
    buffer[0] === 0x50 &&
    buffer[1] === 0x4b &&
    (buffer[2] === 0x03 || buffer[2] === 0x05 || buffer[2] === 0x07) &&
    (buffer[3] === 0x04 || buffer[3] === 0x06 || buffer[3] === 0x08)
  );
}

function isOleDocBuffer(buffer: Buffer): boolean {
  return (
    buffer.length >= 8 &&
    buffer[0] === 0xd0 &&
    buffer[1] === 0xcf &&
    buffer[2] === 0x11 &&
    buffer[3] === 0xe0 &&
    buffer[4] === 0xa1 &&
    buffer[5] === 0xb1 &&
    buffer[6] === 0x1a &&
    buffer[7] === 0xe1
  );
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

export async function processAndSaveDocument(
  file: File,
  category: DocumentUploadCategory = "volunteer-docs"
): Promise<{ url: string; filename: string }> {
  const ext = documentExtension(file);
  const mimeAllowed =
    ALLOWED_DOCUMENT_MIME_TYPES.includes(file.type) ||
    (file.type === "" && ext !== null);

  if (!mimeAllowed || !ext) {
    throw new Error("نوع الملف غير مدعوم. يُسمح بـ PDF و DOC و DOCX فقط.");
  }

  const maxBytes = DOCUMENT_MAX_MB * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(`حجم الملف يتجاوز الحد الأقصى (${DOCUMENT_MAX_MB} ميغابايت).`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const contentOk =
    (ext === "pdf" && isPdfBuffer(buffer)) ||
    (ext === "docx" && isZipBuffer(buffer)) ||
    (ext === "doc" && isOleDocBuffer(buffer));

  if (!contentOk) {
    throw new Error("محتوى الملف غير صالح.");
  }

  const filename = `${randomUUID()}.${ext}`;
  const dir = getCategoryDir(category);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);

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
  const category = match[1];
  return isUploadCategory(category) ? category : null;
}
