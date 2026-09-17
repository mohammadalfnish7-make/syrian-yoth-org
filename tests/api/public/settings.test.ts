import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/public/settings/route";
import { mockPrisma } from "../../setup.api";

describe("GET /api/public/settings", () => {
  it("returns public site settings as key-value map", async () => {
    mockPrisma.siteSetting.findMany.mockResolvedValue([
      { key: "hero", value: { title: "Hero Title" } },
      { key: "contact", value: { email: "info@yaf.org" } },
    ]);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.hero).toEqual({ title: "Hero Title" });
    expect(data.contact).toEqual({ email: "info@yaf.org" });
    expect(mockPrisma.siteSetting.findMany).toHaveBeenCalledWith({
      where: {
        key: {
          in: ["contact", "social_links", "hero", "about", "branding"],
        },
      },
    });
  });
});
