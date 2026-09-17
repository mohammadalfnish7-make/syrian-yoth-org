import { describe, it, expect, vi } from "vitest";
import { POST, DELETE } from "@/app/api/upload/route";
import { processAndSaveImage, deleteImage } from "@/lib/upload";
import { createJsonRequest, createFormDataRequest } from "../helpers/request";
import {
  setAuthSession,
  superAdminSession,
  governorateAdminSession,
  VALID_UPLOAD_FILENAME,
} from "../helpers/auth";

describe("POST /api/upload", () => {
  it("returns 401 when unauthenticated", async () => {
    const formData = new FormData();
    formData.append("file", new File(["x"], "test.jpg", { type: "image/jpeg" }));
    formData.append("category", "news");

    const res = await POST(createFormDataRequest("/api/upload", formData));
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe("غير مصرح. يرجى تسجيل الدخول.");
  });

  it("returns 400 when no file is attached", async () => {
    await setAuthSession(superAdminSession);
    const formData = new FormData();
    formData.append("category", "news");

    const res = await POST(createFormDataRequest("/api/upload", formData));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("لم يتم إرفاق ملف.");
  });

  it("returns 400 for invalid category", async () => {
    await setAuthSession(superAdminSession);
    const formData = new FormData();
    formData.append("file", new File(["x"], "test.jpg", { type: "image/jpeg" }));
    formData.append("category", "invalid");

    const res = await POST(createFormDataRequest("/api/upload", formData));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("فئة الرفع غير صالحة.");
  });

  it("returns 403 when governorate admin uploads to logos category", async () => {
    await setAuthSession(governorateAdminSession);
    const formData = new FormData();
    formData.append("file", new File(["x"], "test.jpg", { type: "image/jpeg" }));
    formData.append("category", "logos");

    const res = await POST(createFormDataRequest("/api/upload", formData));
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.error).toBe("ليس لديك صلاحية لهذا الإجراء.");
  });

  it("returns 200 on successful upload for authenticated admin", async () => {
    await setAuthSession(governorateAdminSession);
    vi.mocked(processAndSaveImage).mockResolvedValue({
      url: "/api/uploads/news/abc.webp",
      filename: "abc.webp",
    });

    const formData = new FormData();
    formData.append("file", new File(["x"], "test.jpg", { type: "image/jpeg" }));
    formData.append("category", "news");

    const res = await POST(createFormDataRequest("/api/upload", formData));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.url).toBe("/api/uploads/news/abc.webp");
    expect(data.filename).toBe("abc.webp");
  });

  it("returns 400 when image processing fails", async () => {
    await setAuthSession(superAdminSession);
    vi.mocked(processAndSaveImage).mockRejectedValue(
      new Error("نوع الملف غير مدعوم. يُسمح بـ JPEG و PNG و WebP فقط.")
    );

    const formData = new FormData();
    formData.append("file", new File(["x"], "bad.gif", { type: "image/gif" }));
    formData.append("category", "news");

    const res = await POST(createFormDataRequest("/api/upload", formData));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain("نوع الملف غير مدعوم");
  });
});

describe("DELETE /api/upload", () => {
  it("returns 401 when unauthenticated", async () => {
    const res = await DELETE(
      createJsonRequest("/api/upload", "DELETE", {
        url: "/api/uploads/news/test.webp",
      })
    );

    expect(res.status).toBe(401);
  });

  it("returns 400 when url is missing", async () => {
    await setAuthSession(superAdminSession);

    const res = await DELETE(createJsonRequest("/api/upload", "DELETE", {}));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("رابط الملف مطلوب.");
  });

  it("returns 400 for invalid url", async () => {
    await setAuthSession(superAdminSession);

    const res = await DELETE(
      createJsonRequest("/api/upload", "DELETE", { url: "/invalid/path" })
    );
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("رابط الملف غير صالح.");
  });

  it("returns 200 on successful delete", async () => {
    await setAuthSession(superAdminSession);
    vi.mocked(deleteImage).mockResolvedValue(undefined);

    const res = await DELETE(
      createJsonRequest("/api/upload", "DELETE", {
        url: `/api/uploads/news/${VALID_UPLOAD_FILENAME}`,
      })
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe("تم حذف الملف.");
    expect(deleteImage).toHaveBeenCalledWith("news", VALID_UPLOAD_FILENAME);
  });

  it("returns 400 for path traversal filename in delete url", async () => {
    await setAuthSession(superAdminSession);
    const actual = await vi.importActual<typeof import("@/lib/upload")>(
      "@/lib/upload"
    );
    vi.mocked(deleteImage).mockImplementation(actual.deleteImage);

    const res = await DELETE(
      createJsonRequest("/api/upload", "DELETE", {
        url: "/api/uploads/news/../../etc/passwd",
      })
    );
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain("غير صالح");
  });
});
