import { describe, it, expect } from "vitest";
import { GET, PUT } from "@/app/api/admin/settings/route";
import { mockPrisma } from "../../setup.api";
import { createJsonRequest } from "../../helpers/request";
import {
  setAuthSession,
  superAdminSession,
  governorateAdminSession,
} from "../../helpers/auth";

describe("GET /api/admin/settings", () => {
  it("returns 401 when unauthenticated", async () => {
    const res = await GET(createJsonRequest("/api/admin/settings", "GET"));
    expect(res.status).toBe(401);
  });

  it("returns 403 for governorate admin (RBAC)", async () => {
    await setAuthSession(governorateAdminSession);

    const res = await GET(createJsonRequest("/api/admin/settings", "GET"));
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.error).toBe("ليس لديك صلاحية لهذا الإجراء.");
  });

  it("returns settings for super admin", async () => {
    await setAuthSession(superAdminSession);
    mockPrisma.siteSetting.findMany.mockResolvedValue([
      { key: "hero", value: { title: "Test" } },
      { key: "contact", value: { email: "test@example.com" } },
    ]);

    const res = await GET(createJsonRequest("/api/admin/settings", "GET"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.hero).toEqual({ title: "Test" });
    expect(data.contact).toEqual({ email: "test@example.com" });
  });
});

describe("PUT /api/admin/settings", () => {
  it("returns 401 when unauthenticated", async () => {
    const res = await PUT(
      createJsonRequest("/api/admin/settings", "PUT", { hero: { title: "X" } })
    );
    expect(res.status).toBe(401);
  });

  it("returns 403 for governorate admin (RBAC)", async () => {
    await setAuthSession(governorateAdminSession);

    const res = await PUT(
      createJsonRequest("/api/admin/settings", "PUT", { hero: { title: "X" } })
    );

    expect(res.status).toBe(403);
  });

  it("upserts settings and creates audit log for super admin", async () => {
    await setAuthSession(superAdminSession);
    mockPrisma.siteSetting.upsert.mockResolvedValue({});
    mockPrisma.auditLog.create.mockResolvedValue({});

    const res = await PUT(
      createJsonRequest("/api/admin/settings", "PUT", {
        hero: {
          title: "Updated",
          subtitle: "Subtitle",
          tagline: "Tagline",
          imageUrl: "/images/hero/ramadan-session.webp",
        },
        contact: {
          email: "info@example.com",
          phone: "123",
          address: "Damascus",
          website: "https://example.com",
        },
      })
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe("تم حفظ الإعدادات.");
    expect(mockPrisma.siteSetting.upsert).toHaveBeenCalledTimes(2);
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

  it("returns 400 for invalid settings payload", async () => {
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

  it("returns 500 on database error", async () => {
    await setAuthSession(superAdminSession);
    mockPrisma.siteSetting.upsert.mockRejectedValue(new Error("db error"));

    const res = await PUT(
      createJsonRequest("/api/admin/settings", "PUT", {
        hero: {
          title: "X",
          subtitle: "Y",
          tagline: "Z",
          imageUrl: null,
        },
      })
    );

    expect(res.status).toBe(500);
  });
});
