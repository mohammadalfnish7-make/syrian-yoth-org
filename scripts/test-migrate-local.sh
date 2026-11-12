#!/bin/sh
# Local pre-deploy check for the Coolify migrate flow.
# Spins up an isolated Postgres on 5433, simulates the OLD volunteer table,
# then runs scripts/db-migrate.sh the same way production does.
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$ROOT_DIR"

CONTAINER_NAME="syrian-yoth-migrate-test-db"
DB_PORT=5433
DB_USER=yaf
DB_PASS=testmigratepass
DB_NAME=yaf_db
DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@127.0.0.1:${DB_PORT}/${DB_NAME}?schema=public"
SEED_ADMIN_PASSWORD="local-test-password-16"

cleanup() {
  echo "▶ cleanup test database container"
  docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "▶ starting isolated Postgres on :${DB_PORT}"
docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
docker run -d --name "$CONTAINER_NAME" \
  -e POSTGRES_USER="$DB_USER" \
  -e POSTGRES_PASSWORD="$DB_PASS" \
  -e POSTGRES_DB="$DB_NAME" \
  -p "${DB_PORT}:5432" \
  postgres:16-alpine >/dev/null

echo "▶ waiting for Postgres"
i=0
until docker exec "$CONTAINER_NAME" pg_isready -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; do
  i=$((i + 1))
  if [ "$i" -gt 30 ]; then
    echo "Postgres did not become ready"
    exit 1
  fi
  sleep 1
done

echo "▶ creating OLD volunteer_requests shape (pre-unified form)"
docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" <<'SQL'
CREATE TABLE IF NOT EXISTS "governorates" (
  "id" TEXT PRIMARY KEY,
  "name_ar" TEXT NOT NULL,
  "name_en" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "governorates" ("id", "name_ar", "name_en", "sort_order")
VALUES ('gov-1', 'دمشق', 'Damascus', 1)
ON CONFLICT ("id") DO NOTHING;

CREATE TYPE "RequestStatus" AS ENUM ('new', 'reviewed', 'accepted', 'rejected');

CREATE TABLE "volunteer_requests" (
  "id" TEXT PRIMARY KEY,
  "full_name" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "email" TEXT,
  "governorate_id" TEXT NOT NULL REFERENCES "governorates"("id"),
  "message" TEXT,
  "status" "RequestStatus" NOT NULL DEFAULT 'new',
  "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "volunteer_requests" ("id", "full_name", "phone", "governorate_id")
VALUES ('old-1', 'Old Volunteer', '0999999999', 'gov-1');
SQL

echo "▶ generating Prisma client"
npx prisma generate >/dev/null

echo "▶ running migrate script against old schema"
export DATABASE_URL
export SEED_ADMIN_USERNAME=admin
export SEED_ADMIN_PASSWORD
export NODE_ENV=production

sh "$ROOT_DIR/scripts/db-migrate.sh"

echo "▶ verifying new volunteer_requests columns exist"
docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "\d volunteer_requests" | tee /tmp/syrian-yoth-volunteer-schema.txt

grep -q "gender" /tmp/syrian-yoth-volunteer-schema.txt
grep -q "telegram" /tmp/syrian-yoth-volunteer-schema.txt
grep -q "cv_url" /tmp/syrian-yoth-volunteer-schema.txt
grep -q "id_document_url" /tmp/syrian-yoth-volunteer-schema.txt

echo "▶ verifying seed created governorates + admin"
GOV_COUNT=$(docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -tAc 'SELECT COUNT(*) FROM governorates')
ADMIN_COUNT=$(docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -tAc 'SELECT COUNT(*) FROM admins')

echo "governorates=$GOV_COUNT admins=$ADMIN_COUNT"
[ "$GOV_COUNT" -ge 14 ]
[ "$ADMIN_COUNT" -ge 1 ]

echo "✅ local migrate test passed"
