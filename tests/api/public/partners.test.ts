import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/public/partners/route";
import { mockPrisma } from "../../setup.api";

describe("GET /api/public/partners", () => {
  it("returns active partners ordered by sortOrder", async () => {
    const partners = [
      { id: "1", name: "Partner A", sortOrder: 0, isActive: true },
      { id: "2", name: "Partner B", sortOrder: 1, isActive: true },
    ];
    mockPrisma.partner.findMany.mockResolvedValue(partners);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual(partners);
    expect(mockPrisma.partner.findMany).toHaveBeenCalledWith({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  });
});
