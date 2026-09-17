import { vi, beforeEach } from "vitest";

export const cookieStore = new Map<string, string>();

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) => {
      const value = cookieStore.get(name);
      return value ? { name, value } : undefined;
    },
    set: (opts: { name: string; value: string; maxAge?: number }) => {
      if (opts.maxAge === 0) {
        cookieStore.delete(opts.name);
      } else {
        cookieStore.set(opts.name, opts.value);
      }
    },
  })),
}));

export const mockPrisma = {
  admin: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  news: {
    findMany: vi.fn(),
    count: vi.fn(),
  },
  impactStat: {
    findMany: vi.fn(),
  },
  partner: {
    findMany: vi.fn(),
  },
  boardMember: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  siteSetting: {
    findMany: vi.fn(),
    upsert: vi.fn(),
  },
  auditLog: {
    create: vi.fn(),
  },
};

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

vi.mock("@/lib/upload", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/upload")>();
  return {
    ...actual,
    processAndSaveImage: vi.fn(),
    deleteImage: vi.fn(),
  };
});

beforeEach(() => {
  cookieStore.clear();
  vi.clearAllMocks();
});
