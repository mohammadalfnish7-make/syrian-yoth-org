import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFile } from "fs/promises";
import { GET } from "@/app/api/uploads/[...path]/route";
import { createGetRequest } from "../helpers/request";

vi.mock("fs/promises", async (importOriginal) => {
  const actual = await importOriginal<typeof import("fs/promises")>();
  return {
    ...actual,
    readFile: vi.fn(),
  };
});

describe("GET /api/uploads/[...path]", () => {
  beforeEach(() => {
    vi.mocked(readFile).mockReset();
  });

  it("returns 404 when path has wrong number of segments", async () => {
    const res = await GET(createGetRequest("/api/uploads/news"), {
      params: Promise.resolve({ path: ["news"] }),
    });

    expect(res.status).toBe(404);
  });

  it("returns 404 for invalid category", async () => {
    const res = await GET(createGetRequest("/api/uploads/invalid/file.webp"), {
      params: Promise.resolve({ path: ["invalid", "file.webp"] }),
    });

    expect(res.status).toBe(404);
  });

  it("serves manager images from the managers category", async () => {
    const fileBuffer = Buffer.from("manager-webp");
    vi.mocked(readFile).mockResolvedValue(fileBuffer);

    const res = await GET(createGetRequest("/api/uploads/managers/test.webp"), {
      params: Promise.resolve({
        path: ["managers", "550e8400-e29b-41d4-a716-446655440000.webp"],
      }),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("image/webp");
  });

  it("returns 400 for path traversal in filename", async () => {
    const res = await GET(createGetRequest("/api/uploads/news/../secret"), {
      params: Promise.resolve({ path: ["news", "../secret"] }),
    });

    expect(res.status).toBe(404);
  });

  it("returns 404 for invalid filename format", async () => {
    const res = await GET(createGetRequest("/api/uploads/news/test.webp"), {
      params: Promise.resolve({ path: ["news", "test.webp"] }),
    });

    expect(res.status).toBe(404);
  });

  it("returns 400 for slash in filename", async () => {
    const res = await GET(createGetRequest("/api/uploads/news/a/b"), {
      params: Promise.resolve({ path: ["news", "a/b"] }),
    });

    expect(res.status).toBe(404);
  });

  it("returns image with correct headers on success", async () => {
    const fileBuffer = Buffer.from("fake-webp-data");
    vi.mocked(readFile).mockResolvedValue(fileBuffer);

    const res = await GET(createGetRequest("/api/uploads/news/test.webp"), {
      params: Promise.resolve({
        path: ["news", "550e8400-e29b-41d4-a716-446655440000.webp"],
      }),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("image/webp");
    expect(res.headers.get("Cache-Control")).toContain("max-age=31536000");
    const body = Buffer.from(await res.arrayBuffer());
    expect(body.equals(fileBuffer)).toBe(true);
  });

  it("returns 404 when file does not exist", async () => {
    vi.mocked(readFile).mockRejectedValue(new Error("ENOENT"));

    const res = await GET(createGetRequest("/api/uploads/news/missing.webp"), {
      params: Promise.resolve({ path: ["news", "missing.webp"] }),
    });

    expect(res.status).toBe(404);
  });
});
