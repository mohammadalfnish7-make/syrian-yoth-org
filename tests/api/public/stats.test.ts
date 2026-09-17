import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/public/stats/route";
import { mockPrisma } from "../../setup.api";

describe("GET /api/public/stats", () => {
  it("returns active impact stats ordered by sortOrder", async () => {
    const stats = [
      { id: "1", labelAr: "متطوع", value: "+1500", sortOrder: 0, isActive: true },
      { id: "2", labelAr: "شاب", value: "+500K", sortOrder: 1, isActive: true },
    ];
    mockPrisma.impactStat.findMany.mockResolvedValue(stats);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual(stats);
    expect(mockPrisma.impactStat.findMany).toHaveBeenCalledWith({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  });
});
