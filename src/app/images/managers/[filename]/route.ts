import { NextRequest, NextResponse } from "next/server";
import { readManagerImage } from "@/lib/upload";

type RouteParams = { params: Promise<{ filename: string }> };

/** Legacy board-member URLs stored as /images/managers/{uuid}.webp */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { filename } = await params;

  try {
    const file = await readManagerImage(filename);
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
