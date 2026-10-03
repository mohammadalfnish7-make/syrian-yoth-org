import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import {
  contentTypeForUpload,
  isUploadCategory,
  resolveUploadPath,
} from "@/lib/upload";

function fileResponse(file: Buffer, contentType: string, request: NextRequest) {
  const size = file.length;
  const headers = {
    "Content-Type": contentType,
    "Cache-Control": "public, max-age=31536000, immutable",
    "Accept-Ranges": "bytes",
  };

  if (contentType !== "video/mp4") {
    return new NextResponse(new Uint8Array(file), { headers });
  }

  const range = request.headers.get("range");
  if (!range) {
    return new NextResponse(new Uint8Array(file), {
      headers: {
        ...headers,
        "Content-Length": String(size),
      },
    });
  }

  const match = /^bytes=(\d*)-(\d*)$/.exec(range);
  if (!match || size === 0) {
    return new NextResponse(null, {
      status: 416,
      headers: { "Content-Range": `bytes */${size}` },
    });
  }

  let start = match[1] === "" ? Number.NaN : Number(match[1]);
  let end = match[2] === "" ? size - 1 : Number(match[2]);

  if (Number.isNaN(start)) {
    const suffix = Number(match[2]);
    if (!Number.isFinite(suffix)) {
      return new NextResponse(null, {
        status: 416,
        headers: { "Content-Range": `bytes */${size}` },
      });
    }
    start = Math.max(size - suffix, 0);
    end = size - 1;
  }

  if (start >= size || start > end) {
    return new NextResponse(null, {
      status: 416,
      headers: { "Content-Range": `bytes */${size}` },
    });
  }

  end = Math.min(end, size - 1);
  const chunk = file.subarray(start, end + 1);

  return new NextResponse(new Uint8Array(chunk), {
    status: 206,
    headers: {
      ...headers,
      "Content-Length": String(chunk.length),
      "Content-Range": `bytes ${start}-${end}/${size}`,
    },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;

  if (segments.length !== 2) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [category, filename] = segments;

  if (!isUploadCategory(category)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const filePath = resolveUploadPath(category, filename);
    const file = await readFile(filePath);
    return fileResponse(file, contentTypeForUpload(filename), request);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
