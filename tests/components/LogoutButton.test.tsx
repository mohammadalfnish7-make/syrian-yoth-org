import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LogoutButton } from "@/components/admin/LogoutButton";

const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

describe("LogoutButton", () => {
  it("renders logout button with bilingual text", () => {
    render(<LogoutButton />);
    expect(screen.getByText("تسجيل الخروج")).toBeInTheDocument();
    expect(screen.getByText("Log out")).toBeInTheDocument();
  });

  it("calls logout API and redirects to login", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true });

    render(<LogoutButton />);
    await userEvent.click(screen.getByText("Log out"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/auth/logout", {
        method: "POST",
      });
      expect(mockPush).toHaveBeenCalledWith("/admin/login");
      expect(mockRefresh).toHaveBeenCalled();
    });
  });
});
