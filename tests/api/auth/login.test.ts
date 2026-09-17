import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";
import { POST } from "@/app/api/auth/login/route";
import { mockPrisma } from "../../setup.api";
import { createJsonRequest } from "../../helpers/request";
import { cookieStore } from "../../setup.api";

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
  },
}));

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    cookieStore.clear();
  });

  it("returns 400 when username or password is missing", async () => {
    const res = await POST(createJsonRequest("/api/auth/login", "POST", {}));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("اسم المستخدم وكلمة المرور مطلوبان.");
  });

  it("returns 401 when admin is not found", async () => {
    mockPrisma.admin.findUnique.mockResolvedValue(null);

    const res = await POST(
      createJsonRequest("/api/auth/login", "POST", {
        username: "unknown",
        password: "secret",
      })
    );
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe("بيانات الدخول غير صحيحة.");
  });

  it("returns 401 when admin is inactive", async () => {
    mockPrisma.admin.findUnique.mockResolvedValue({
      id: "admin-1",
      username: "admin",
      passwordHash: "hash",
      role: "SUPER_ADMIN",
      governorateId: null,
      isActive: false,
      governorate: null,
    });

    const res = await POST(
      createJsonRequest("/api/auth/login", "POST", {
        username: "admin",
        password: "secret",
      })
    );

    expect(res.status).toBe(401);
  });

  it("returns 401 when password is invalid", async () => {
    mockPrisma.admin.findUnique.mockResolvedValue({
      id: "admin-1",
      username: "admin",
      passwordHash: "hash",
      role: "SUPER_ADMIN",
      governorateId: null,
      isActive: true,
      governorate: null,
    });
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    const res = await POST(
      createJsonRequest("/api/auth/login", "POST", {
        username: "admin",
        password: "wrong",
      })
    );

    expect(res.status).toBe(401);
  });

  it("returns 200 and sets auth cookie on success", async () => {
    mockPrisma.admin.findUnique.mockResolvedValue({
      id: "admin-1",
      username: "admin",
      passwordHash: "hash",
      role: "SUPER_ADMIN",
      governorateId: null,
      isActive: true,
      governorate: null,
    });
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    mockPrisma.admin.update.mockResolvedValue({});

    const res = await POST(
      createJsonRequest("/api/auth/login", "POST", {
        username: "admin",
        password: "correct",
      })
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.admin).toEqual({
      id: "admin-1",
      username: "admin",
      role: "SUPER_ADMIN",
      governorate: null,
    });
    expect(cookieStore.has("yaf_token")).toBe(true);
    expect(mockPrisma.admin.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "admin-1" } })
    );
  });

  it("returns 500 on unexpected errors", async () => {
    mockPrisma.admin.findUnique.mockRejectedValue(new Error("db down"));

    const res = await POST(
      createJsonRequest("/api/auth/login", "POST", {
        username: "admin",
        password: "secret",
      })
    );

    expect(res.status).toBe(500);
  });
});
