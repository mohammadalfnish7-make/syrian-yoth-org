import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import type { UploadCategory } from "@/lib/upload";
import { resolveUploadPath } from "@/lib/upload";

const VALID_CATEGORIES: UploadCategory[] = [
  "news",
  "partners",
  "programs",
  "site",
  "logos",
  "managers",
];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;

  if (segments.length !== 2) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [category, filename] = segments;

  if (!VALID_CATEGORIES.includes(category as UploadCategory)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const filePath = resolveUploadPath(category as UploadCategory, filename);
    const file = await readFile(filePath);
    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
