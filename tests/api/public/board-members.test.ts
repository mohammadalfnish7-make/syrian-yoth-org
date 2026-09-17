import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/public/board-members/route";
import { mockPrisma } from "../../setup.api";

describe("GET /api/public/board-members", () => {
  it("returns active board members ordered by sortOrder", async () => {
    const members = [
      {
        id: "bm-1",
        nameAr: "أحمد",
        nameEn: "Ahmad",
        roleAr: "رئيس مجلس الإدارة",
        roleEn: "Board Chair",
        bioAr: "قيادة المؤسسة وتوجيه استراتيجيتها",
        bioEn: "Leads the foundation and its strategy",
        imageUrl: "/images/managers/test.webp",
        sortOrder: 0,
      },
    ];
    mockPrisma.boardMember.findMany.mockResolvedValue(members);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual(members);
    expect(mockPrisma.boardMember.findMany).toHaveBeenCalledWith({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        nameAr: true,
        nameEn: true,
        roleAr: true,
        roleEn: true,
        bioAr: true,
        bioEn: true,
        imageUrl: true,
        sortOrder: true,
      },
    });
  });
});
