import { prisma } from "@/lib/prisma";
import { apiSuccess } from "@/lib/api-utils";

const PUBLIC_KEYS = ["contact", "social_links", "hero", "about", "branding"];

export async function GET() {
  const settings = await prisma.siteSetting.findMany({
    where: { key: { in: PUBLIC_KEYS } },
  });

  const result: Record<string, unknown> = {};
  for (const s of settings) {
    result[s.key] = s.value;
  }

  return apiSuccess(result);
}
