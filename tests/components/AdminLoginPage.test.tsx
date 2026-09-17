import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminLoginPage from "@/app/admin/login/page";

const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

describe("AdminLoginPage", () => {
  it("renders login form fields", () => {
    render(<AdminLoginPage />);

    expect(screen.getByRole("heading", { name: "تسجيل الدخول" })).toBeInTheDocument();
    expect(screen.getByLabelText("اسم المستخدم")).toBeInTheDocument();
    expect(screen.getByLabelText("كلمة المرور")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "تسجيل الدخول" })
    ).toBeInTheDocument();
  });

  it("shows error on failed login", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "بيانات الدخول غير صحيحة." }),
    });

    render(<AdminLoginPage />);

    await userEvent.type(screen.getByLabelText("اسم المستخدم"), "admin");
    await userEvent.type(screen.getByLabelText("كلمة المرور"), "wrong");
    await userEvent.click(
      screen.getByRole("button", { name: "تسجيل الدخول" })
    );

    await waitFor(() => {
      expect(screen.getByText("بيانات الدخول غير صحيحة.")).toBeInTheDocument();
    });
  });

  it("redirects to dashboard on successful login", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        admin: { id: "1", username: "admin", role: "SUPER_ADMIN" },
      }),
    });

    render(<AdminLoginPage />);

    await userEvent.type(screen.getByLabelText("اسم المستخدم"), "admin");
    await userEvent.type(screen.getByLabelText("كلمة المرور"), "correct");
    await userEvent.click(
      screen.getByRole("button", { name: "تسجيل الدخول" })
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/admin/dashboard");
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("shows loading state while submitting", async () => {
    let resolveFetch: (value: unknown) => void;
    global.fetch = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        })
    );

    render(<AdminLoginPage />);

    await userEvent.type(screen.getByLabelText("اسم المستخدم"), "admin");
    await userEvent.type(screen.getByLabelText("كلمة المرور"), "pass");
    await userEvent.click(
      screen.getByRole("button", { name: "تسجيل الدخول" })
    );

    expect(screen.getByText("جاري الدخول...")).toBeInTheDocument();

    resolveFetch!({
      ok: true,
      json: async () => ({ admin: {} }),
    });
  });
});
