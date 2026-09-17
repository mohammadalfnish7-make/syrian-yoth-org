import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/(site)/page";

vi.mock("@/lib/settings", () => ({
  getPublicSettings: vi.fn().mockResolvedValue({
    hero: {
      title: "جيلٌ شابٌ متمكنٌ وقوي",
      subtitle: "نصنع من طاقة الشباب السوري قيادةً تبني، لا فعاليات تمر.",
      tagline: "We transform Syrian youth energy into leadership and community impact.",
      imageUrl: null,
    },
    about: {
      mission: {
        ar: "تمكين الشباب السوري من تحويل طاقتهم اللامنة إلى أثر حقيقي في مجتمعهم ووطنهم.",
        en: "Empowering Syrian youth to transform their latent energy into real impact.",
      },
      vision: {
        ar: "أن نكون المؤسسة الشبابية الرائدة في سوريا.",
        en: "To be Syria's leading youth foundation.",
      },
      values: [
        { ar: "الكرامة", en: "Dignity" },
        { ar: "التكافل", en: "Solidarity" },
      ],
    },
    contact: {
      email: "info@syrianyouth.com",
      phone: "5756877",
      address: "دمشق، سوريا",
      website: "www.syrianyouth.com",
    },
    social_links: {
      facebook: "",
      instagram: "",
      twitter: "",
      youtube: "",
      linkedin: "",
    },
    branding: {
      logoUrl: null,
      logoMarkUrl: null,
      faviconUrl: "/favicon.png",
    },
  }),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    impactStat: {
      findMany: vi.fn().mockResolvedValue([
        {
          id: "1",
          value: "1500+",
          labelAr: "متطوع",
          labelEn: "Volunteers",
        },
        {
          id: "2",
          value: "500000+",
          labelAr: "شاب مستفيد",
          labelEn: "Youth Reached",
        },
      ]),
    },
    program: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    news: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    governorate: {
      findMany: vi.fn().mockResolvedValue([
        { id: "gov-1", nameAr: "دمشق", nameEn: "Damascus", sortOrder: 1 },
      ]),
    },
  },
}));

describe("HomePage", () => {
  it("renders hero section with bilingual content", async () => {
    render(await HomePage());

    expect(
      screen.getByText(/منظمة سورية مستقلة في المجتمع المدني/)
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /قادر و/ })).toBeInTheDocument();
    expect(
      screen.getByText(
        "نصنع من طاقة الشباب السوري قيادةً تبني، لا فعاليات تمر."
      )
    ).toBeInTheDocument();
  });

  it("renders stats in hero section", async () => {
    const { container } = render(await HomePage());
    const heroStats = container.querySelector(".hero-stats");

    expect(heroStats).toBeTruthy();
    expect(heroStats).toHaveTextContent("1500+");
    expect(heroStats).toHaveTextContent("متطوع");
    expect(heroStats).toHaveTextContent("500000+");
    expect(heroStats).toHaveTextContent("شاب مستفيد");
  });

  it("renders about section with values", async () => {
    render(await HomePage());

    expect(screen.getByText("من نحن")).toBeInTheDocument();
    expect(screen.getByText("الكرامة")).toBeInTheDocument();
    expect(screen.getByText("التكافل")).toBeInTheDocument();
  });

  it("renders focus areas section", async () => {
    render(await HomePage());

    expect(screen.getByText("محاور عملنا الأساسية")).toBeInTheDocument();
    expect(screen.getByText("القيادة")).toBeInTheDocument();
  });

  it("renders programs section with default programs", async () => {
    render(await HomePage());

    expect(screen.getByText("برامج مميزة")).toBeInTheDocument();
    expect(screen.getByText("أكاديمية قادة الشباب")).toBeInTheDocument();
  });

  it("renders involve section CTA cards", async () => {
    render(await HomePage());

    expect(screen.getByText("كن جزءاً من التغيير")).toBeInTheDocument();
    expect(screen.getByText("كن متطوعاً")).toBeInTheDocument();
  });

  it("does not render any images", async () => {
    const { container } = render(await HomePage());

    expect(container.querySelectorAll("img")).toHaveLength(0);
  });
});
