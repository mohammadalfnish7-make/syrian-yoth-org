import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/public/news/route";
import { mockPrisma } from "../../setup.api";
import { createGetRequest } from "../../helpers/request";

describe("GET /api/public/news", () => {
  it("returns paginated published news", async () => {
    const newsItems = [
      {
        id: "news-1",
        title: "Test News",
        status: "published",
        governorate: { nameAr: "دمشق" },
      },
    ];
    mockPrisma.news.findMany.mockResolvedValue(newsItems);
    mockPrisma.news.count.mockResolvedValue(1);

    const res = await GET(createGetRequest("/api/public/news"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.news).toEqual(newsItems);
    expect(data.pagination).toEqual({
      page: 1,
      limit: 12,
      total: 1,
      totalPages: 1,
    });
  });

  it("filters by governorate_id", async () => {
    mockPrisma.news.findMany.mockResolvedValue([]);
    mockPrisma.news.count.mockResolvedValue(0);

    await GET(createGetRequest("/api/public/news?governorate_id=gov-1"));

    expect(mockPrisma.news.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: "published",
          governorateId: "gov-1",
        }),
      })
    );
  });

  it("supports pagination via page param", async () => {
    mockPrisma.news.findMany.mockResolvedValue([]);
    mockPrisma.news.count.mockResolvedValue(25);

    const res = await GET(createGetRequest("/api/public/news?page=2"));
    const data = await res.json();

    expect(mockPrisma.news.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 12, take: 12 })
    );
    expect(data.pagination.page).toBe(2);
    expect(data.pagination.totalPages).toBe(3);
  });

  it("clamps page to minimum of 1", async () => {
    mockPrisma.news.findMany.mockResolvedValue([]);
    mockPrisma.news.count.mockResolvedValue(0);

    const res = await GET(createGetRequest("/api/public/news?page=0"));
    const data = await res.json();

    expect(data.pagination.page).toBe(1);
  });
});
