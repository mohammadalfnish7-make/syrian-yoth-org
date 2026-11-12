#!/bin/sh
# Production-safe schema sync:
# - Never uses global --accept-data-loss
# - Never touches news/programs/settings/etc.
# - If push fails because the old volunteer_requests shape is incompatible
#   with the unified form, drop ONLY that table and retry once.
set -eu

echo "▶ prisma db push"
if npx prisma db push; then
  echo "▶ db:seed (governorates + admin only)"
  npm run db:seed
  exit 0
fi

echo "⚠ prisma db push failed (likely incompatible volunteer_requests columns)."
echo "▶ Dropping only volunteer_requests, then retrying push once..."
printf 'DROP TABLE IF EXISTS "volunteer_requests" CASCADE;\n' | npx prisma db execute --stdin

npx prisma db push
echo "▶ db:seed (governorates + admin only)"
npm run db:seed
echo "✅ migrate complete"
