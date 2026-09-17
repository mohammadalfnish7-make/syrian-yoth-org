import { describe, it, expect, vi } from "vitest";
import { GET, PUT } from "@/app/api/admin/settings/route";
import { POST as uploadPost, DELETE as uploadDelete } from "@/app/api/upload/route";
import { POST as loginPost } from "@/app/api/auth/login/route";
import { POST as logoutPost } from "@/app/api/auth/logout/route";
import { mockPrisma } from "../setup.api";
import { createJsonRequest, createFormDataRequest } from "../helpers/request";
import {
  setAuthSession,
  superAdminSession,
  governorateAdminSession,
} from "../helpers/auth";

/**
 * Admin services auth matrix — every protected admin endpoint must reject
 * unauthenticated requests and enforce RBAC where applicable.
 */
describe("Admin services — authentication", () => {
  const protectedEndpoints = [
    {
      name: "GET /api/admin/settings",
      call: () => GET(createJsonRequest("/api/admin/settings", "GET")),
    },
    {
      name: "PUT /api/admin/settings",
      call: () =>
        PUT(
          createJsonRequest("/api/admin/settings", "PUT", {
            hero: {
              title: "X",
              subtitle: "Y",
              tagline: "Z",
              imageUrl: null,
            },
          })
        ),
    },
    {
      name: "POST /api/upload",
      call: () => {
        const formData = new FormData();
        formData.append("file", new File(["x"], "test.jpg", { type: "image/jpeg" }));
        formData.append("category", "news");
        return uploadPost(createFormDataRequest("/api/upload", formData));
      },
    },
    {
      name: "DELETE /api/upload",
      call: () =>
        uploadDelete(
          createJsonRequest("/api/upload", "DELETE", {
            url: "/api/uploads/news/550e8400-e29b-41d4-a716-446655440000.webp",
          })
        ),
    },
  ];

  it.each(protectedEndpoints)(
    "$name returns 401 when unauthenticated",
    async ({ call }) => {
      const res = await call();
      expect(res.status).toBe(401);
    }
  );
});

describe("Admin services — RBAC", () => {
  it("GET /api/admin/settings returns 403 for governorate admin", async () => {
    await setAuthSession(governorateAdminSession);

    const res = await GET(createJsonRequest("/api/admin/settings", "GET"));
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.error).toBe("ليس لديك صلاحية لهذا الإجراء.");
  });

  it("PUT /api/admin/settings returns 403 for governorate admin", async () => {
    await setAuthSession(governorateAdminSession);

    const res = await PUT(
      createJsonRequest("/api/admin/settings", "PUT", {
        hero: { title: "X", subtitle: "Y", tagline: "Z", imageUrl: null },
      })
    );

    expect(res.status).toBe(403);
  });

  it("POST /api/upload returns 403 for logos category as governorate admin", async () => {
    await setAuthSession(governorateAdminSession);
    const formData = new FormData();
    formData.append("file", new File(["x"], "test.jpg", { type: "image/jpeg" }));
    formData.append("category", "logos");

    const res = await uploadPost(createFormDataRequest("/api/upload", formData));
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.error).toBe("ليس لديك صلاحية لهذا الإجراء.");
  });

  it("POST /api/upload allows news category for governorate admin", async () => {
    await setAuthSession(governorateAdminSession);
    const { processAndSaveImage } = await import("@/lib/upload");
    vi.mocked(processAndSaveImage).mockResolvedValue({
      url: "/api/uploads/news/abc.webp",
      filename: "abc.webp",
    });

    const formData = new FormData();
    formData.append("file", new File(["x"], "test.jpg", { type: "image/jpeg" }));
    formData.append("category", "news");

    const res = await uploadPost(createFormDataRequest("/api/upload", formData));
    expect(res.status).toBe(200);
  });
});

describe("Admin services — settings", () => {
  it("GET /api/admin/settings returns all settings for super admin", async () => {
    await setAuthSession(superAdminSession);
    mockPrisma.siteSetting.findMany.mockResolvedValue([
      { key: "hero", value: { title: "Test Hero" } },
      { key: "contact", value: { email: "admin@test.com" } },
    ]);

    const res = await GET(createJsonRequest("/api/admin/settings", "GET"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.hero).toEqual({ title: "Test Hero" });
    expect(data.contact).toEqual({ email: "admin@test.com" });
  });

  it("PUT /api/admin/settings validates payload and creates audit log", async () => {
    await setAuthSession(superAdminSession);
    mockPrisma.siteSetting.upsert.mockResolvedValue({});
    mockPrisma.auditLog.create.mockResolvedValue({});

    const res = await PUT(
      createJsonRequest("/api/admin/settings", "PUT", {
        hero: {
          title: "Updated",
          subtitle: "Subtitle",
          tagline: "Tagline",
          imageUrl: null,
        },
      })
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe("تم حفظ الإعدادات.");
    expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          adminId: superAdminSession.sub,
          action: "update",
          entityType: "site_settings",
        }),
      })
    );
  });

  it("PUT /api/admin/settings rejects invalid URLs", async () => {
    await setAuthSession(superAdminSession);

    const res = await PUT(
      createJsonRequest("/api/admin/settings", "PUT", {
        branding: {
          logoUrl: "javascript:alert(1)",
          logoMarkUrl: null,
          faviconUrl: null,
        },
      })
    );
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("بيانات الإعدادات غير صالحة.");
  });
});

describe("Admin services — auth session", () => {
  it("POST /api/auth/logout clears session", async () => {
    await setAuthSession(superAdminSession);

    const res = await logoutPost();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe("تم تسجيل الخروج بنجاح.");
  });

  it("POST /api/auth/login rejects missing credentials", async () => {
    const res = await loginPost(createJsonRequest("/api/auth/login", "POST", {}));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("اسم المستخدم وكلمة المرور مطلوبان.");
  });
});
