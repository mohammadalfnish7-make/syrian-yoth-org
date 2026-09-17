import { test, expect } from "@playwright/test";
import { createTestAuthToken } from "./helpers/auth";

test.describe("Admin login flow", () => {
  test("shows login form and displays error on invalid credentials", async ({
    page,
  }) => {
    await page.route("**/api/auth/login", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ error: "بيانات الدخول غير صحيحة." }),
      });
    });

    await page.goto("/admin/login");

    await expect(page.getByText("لوحة التحكم")).toBeVisible();
    await page.getByLabel("اسم المستخدم").fill("admin");
    await page.getByLabel("كلمة المرور").fill("wrong-password");
    await page.getByRole("button", { name: "تسجيل الدخول" }).click();

    await expect(page.getByText("بيانات الدخول غير صحيحة.")).toBeVisible();
  });

  test("redirects to dashboard on successful login", async ({ page }) => {
    const token = await createTestAuthToken();

    await page.route("**/api/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: {
          "Set-Cookie": `yaf_token=${token}; Path=/; HttpOnly; SameSite=Lax`,
        },
        body: JSON.stringify({
          admin: {
            id: "admin-1",
            username: "admin",
            role: "SUPER_ADMIN",
            governorate: null,
          },
        }),
      });
    });

    await page.goto("/admin/login");

    await page.getByLabel("اسم المستخدم").fill("admin");
    await page.getByLabel("كلمة المرور").fill("correct-password");
    await page.getByRole("button", { name: "تسجيل الدخول" }).click();

    await page.waitForURL("**/admin/dashboard");
    await expect(page.getByText("لوحة التحكم")).toBeVisible();
    await expect(page.getByText("مرحباً، admin")).toBeVisible();
  });
});

test.describe("Public home page", () => {
  test("renders hero heading", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("جيلٌ شابٌ متمكنٌ وقوي")).toBeVisible();
  });
});
