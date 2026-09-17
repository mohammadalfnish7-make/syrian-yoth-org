import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/auth/logout/route";
import { cookieStore } from "../../setup.api";
import { setAuthSession, superAdminSession } from "../../helpers/auth";

describe("POST /api/auth/logout", () => {
  it("clears auth cookie and returns success", async () => {
    await setAuthSession(superAdminSession);
    expect(cookieStore.has("yaf_token")).toBe(true);

    const res = await POST();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe("تم تسجيل الخروج بنجاح.");
    expect(cookieStore.has("yaf_token")).toBe(false);
  });

  it("succeeds even when no session exists", async () => {
    const res = await POST();
    expect(res.status).toBe(200);
  });
});
