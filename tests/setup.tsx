import React from "react";
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { vi, beforeEach, afterEach } from "vitest";

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

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    className,
  }: {
    src: string;
    alt: string;
    fill?: boolean;
    className?: string;
    unoptimized?: boolean;
  }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} />;
  },
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

beforeEach(() => {
  cookieStore.clear();
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});
