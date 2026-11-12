import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

/** Reference list only — not site content. Needed for volunteer form / news by governorate. */
export const SYRIAN_GOVERNORATES = [
  { nameAr: "دمشق", nameEn: "Damascus", sortOrder: 1 },
  { nameAr: "ريف دمشق", nameEn: "Rif Dimashq", sortOrder: 2 },
  { nameAr: "حلب", nameEn: "Aleppo", sortOrder: 3 },
  { nameAr: "حمص", nameEn: "Homs", sortOrder: 4 },
  { nameAr: "حماة", nameEn: "Hama", sortOrder: 5 },
  { nameAr: "اللاذقية", nameEn: "Latakia", sortOrder: 6 },
  { nameAr: "طرطوس", nameEn: "Tartus", sortOrder: 7 },
  { nameAr: "إدلب", nameEn: "Idlib", sortOrder: 8 },
  { nameAr: "الرقة", nameEn: "Raqqa", sortOrder: 9 },
  { nameAr: "دير الزور", nameEn: "Deir ez-Zor", sortOrder: 10 },
  { nameAr: "الحسكة", nameEn: "Al-Hasakah", sortOrder: 11 },
  { nameAr: "السويداء", nameEn: "As-Suwayda", sortOrder: 12 },
  { nameAr: "درعا", nameEn: "Daraa", sortOrder: 13 },
  { nameAr: "القنيطرة", nameEn: "Quneitra", sortOrder: 14 },
] as const;

type SeedPrisma = {
  governorate: {
    upsert: (args: {
      where: { id: string };
      update: Record<string, never>;
      create: {
        id: string;
        nameAr: string;
        nameEn: string;
        sortOrder: number;
      };
    }) => Promise<unknown>;
  };
  admin: {
    findUnique: (args: {
      where: { username: string };
    }) => Promise<{ id: string; username: string } | null>;
    create: (args: {
      data: {
        username: string;
        passwordHash: string;
        role: "SUPER_ADMIN";
      };
    }) => Promise<unknown>;
  };
};

export type SeedOptions = {
  adminUsername?: string;
  adminPassword?: string | undefined;
  nodeEnv?: string | undefined;
};

/**
 * Production-safe seed: governorates + first admin only.
 * Never creates news/programs/events/settings, and never overwrites existing rows.
 */
export async function seedDatabase(
  prisma: SeedPrisma,
  options: SeedOptions = {}
) {
  for (const gov of SYRIAN_GOVERNORATES) {
    await prisma.governorate.upsert({
      where: { id: `gov-${gov.sortOrder}` },
      update: {},
      create: {
        id: `gov-${gov.sortOrder}`,
        nameAr: gov.nameAr,
        nameEn: gov.nameEn,
        sortOrder: gov.sortOrder,
      },
    });
  }

  const adminUsername = options.adminUsername || "admin";
  const adminPassword = options.adminPassword;
  const nodeEnv = options.nodeEnv;
  const existingAdmin = await prisma.admin.findUnique({
    where: { username: adminUsername },
  });

  if (existingAdmin) {
    return {
      governorates: SYRIAN_GOVERNORATES.length,
      adminCreated: false,
      adminExists: true,
    };
  }

  if (!adminPassword) {
    if (nodeEnv === "production") {
      throw new Error(
        "SEED_ADMIN_PASSWORD must be set in production (min 16 characters)"
      );
    }
    return {
      governorates: SYRIAN_GOVERNORATES.length,
      adminCreated: false,
      adminExists: false,
    };
  }

  if (adminPassword.length < 16) {
    throw new Error("SEED_ADMIN_PASSWORD must be at least 16 characters");
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.admin.create({
    data: {
      username: adminUsername,
      passwordHash,
      role: "SUPER_ADMIN",
    },
  });

  return {
    governorates: SYRIAN_GOVERNORATES.length,
    adminCreated: true,
    adminExists: false,
  };
}

async function main() {
  console.log("🌱 Seeding database (governorates + admin only)...");
  const prisma = new PrismaClient();

  try {
    const result = await seedDatabase(prisma, {
      adminUsername: process.env.SEED_ADMIN_USERNAME || "admin",
      adminPassword: process.env.SEED_ADMIN_PASSWORD,
      nodeEnv: process.env.NODE_ENV,
    });

    console.log(`✅ ${result.governorates} governorates ensured`);
    if (result.adminExists) {
      console.log("✅ Super admin already exists (password unchanged)");
    } else if (result.adminCreated) {
      console.log("✅ Super admin created");
    } else {
      console.warn(
        "⚠️  SEED_ADMIN_PASSWORD not set — skipping admin seed in non-production"
      );
    }
    console.log("🎉 Seeding complete (no default site content).");
  } finally {
    await prisma.$disconnect();
  }
}

const ranViaCli = process.argv.some((arg) => {
  const normalized = arg.replace(/\\/g, "/");
  return (
    normalized.endsWith("/prisma/seed.ts") ||
    normalized.endsWith("/prisma/seed.js") ||
    normalized === "prisma/seed.ts" ||
    normalized === "prisma/seed.js"
  );
});

if (ranViaCli) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
