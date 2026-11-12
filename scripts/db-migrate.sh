#!/bin/sh
# Production-safe schema sync for Coolify/docker migrate service.
# - Prefer normal prisma db push (no data loss)
# - If that fails (old volunteer_requests incompatible with unified form),
#   drop ONLY volunteer_requests, then push again
# - Never resets the whole database
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ROOT_DIR=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
cd "$ROOT_DIR"

echo "▶ working directory: $ROOT_DIR"
echo "▶ DATABASE_URL host check"
node -e "const u=process.env.DATABASE_URL||''; if(!u){console.error('DATABASE_URL missing'); process.exit(1)} console.log('DATABASE_URL set')"

echo "▶ prisma db push (attempt 1)"
if npx prisma db push --skip-generate; then
  echo "▶ db:seed (governorates + admin only)"
  npx tsx prisma/seed.ts
  echo "✅ migrate complete"
  exit 0
fi

echo "⚠ prisma db push failed — likely incompatible volunteer_requests schema"
echo "▶ dropping ONLY table volunteer_requests"
node <<'NODE'
const { PrismaClient } = require("@prisma/client");

(async () => {
  const prisma = new PrismaClient();
  try {
    await prisma.$executeRawUnsafe(
      'DROP TABLE IF EXISTS "volunteer_requests" CASCADE'
    );
    console.log("dropped volunteer_requests (if it existed)");
  } catch (error) {
    console.error("failed to drop volunteer_requests:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
NODE

echo "▶ prisma db push (attempt 2 after volunteer_requests drop)"
npx prisma db push --skip-generate

echo "▶ db:seed (governorates + admin only)"
npx tsx prisma/seed.ts
echo "✅ migrate complete"
