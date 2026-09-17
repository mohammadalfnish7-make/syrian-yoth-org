import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ImageUploader } from "@/components/admin/ImageUploader";

describe("ImageUploader", () => {
  it("renders upload button with label", () => {
    render(
      <ImageUploader
        category="news"
        onUpload={vi.fn()}
        label="رفع صورة الغلاف"
      />
    );

    expect(screen.getAllByText("رفع صورة الغلاف").length).toBeGreaterThan(0);
    expect(
      screen.getByText("JPEG, PNG, WebP — حتى 5MB")
    ).toBeInTheDocument();
  });

  it("shows preview and calls onUpload on successful upload", async () => {
    const onUpload = vi.fn();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ url: "/api/uploads/news/test.webp" }),
    });

    render(<ImageUploader category="news" onUpload={onUpload} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["image"], "photo.jpg", { type: "image/jpeg" });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(onUpload).toHaveBeenCalledWith("/api/uploads/news/test.webp");
    });
    expect(screen.getByAltText("معاينة")).toBeInTheDocument();
  });

  it("shows error message on upload failure", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "فشل رفع الصورة" }),
    });

    render(<ImageUploader category="news" onUpload={vi.fn()} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["image"], "photo.jpg", { type: "image/jpeg" });

    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText("فشل رفع الصورة")).toBeInTheDocument();
    });
  });

  it("shows existing preview when currentUrl is provided", () => {
    render(
      <ImageUploader
        category="news"
        currentUrl="/api/uploads/news/existing.webp"
        onUpload={vi.fn()}
      />
    );

    expect(screen.getByAltText("معاينة")).toHaveAttribute(
      "src",
      "/api/uploads/news/existing.webp"
    );
    expect(screen.getByText("تغيير")).toBeInTheDocument();
    expect(screen.getByText("حذف")).toBeInTheDocument();
  });
});
