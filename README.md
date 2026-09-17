# Syrian Youth Foundation

موقع مؤسسة شؤون الشباب — Youth Affairs Foundation

## Tech Stack

- **Next.js 15** (App Router) — Public site + Admin panel + API
- **PostgreSQL** + Prisma ORM
- **Docker Compose** for local dev and production
- **Local image storage** with Sharp compression
- **JWT Auth** with RBAC (Super Admin / Governorate Admin)

## Quick Start

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Start database
docker compose up db -d

# 3. Install dependencies
npm install

# 4. Push schema & seed data
npm run db:push
npm run db:seed

# 5. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Default admin: set `SEED_ADMIN_PASSWORD` in `.env` before seeding (min 16 characters).

```bash
SEED_ADMIN_PASSWORD="your-strong-password-here" npm run db:seed
```

## Font Setup

The site uses **Qomra Arabic** from `عناصر/font/`. To regenerate web fonts:

```bash
pip3 install -r scripts/requirements.txt
python3 scripts/export_design_assets.py --fonts-only
```

Font files are served from `public/fonts/` and loaded via `next/font/local` in `src/lib/fonts.ts`.

## Design Assets

Source design files live in `عناصر/` (PSD, AI, fonts). To export all web-ready assets:

```bash
python3 scripts/export_design_assets.py
```

This generates:
- `public/fonts/QomraArabic-*.woff2`
- `public/images/logo.png` and `public/favicon.png`
- `public/images/hero/*.webp`

## Testing

```bash
# Unit & integration tests (Vitest)
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# E2E tests (Playwright — starts dev server on port 3099)
npm run test:e2e
```

First-time E2E setup: `npx playwright install chromium`

| Suite | Coverage |
|-------|----------|
| API routes | Auth, upload, admin settings, public endpoints |
| Frontend | Home page, admin login, ImageUploader, LogoutButton |
| E2E | Login flow, public home page |

API tests use mocked Prisma — no database required. E2E login uses a mocked API response; for full DB-backed E2E, seed the database first.

## Docker (Full Stack)

1. Create `.env` from `.env.example` and set:
   - `POSTGRES_PASSWORD`
   - `JWT_SECRET` (min 32 chars)
   - `SEED_ADMIN_PASSWORD` (min 16 chars)

2. Build and run:

```bash
docker compose up --build -d
```

3. Open [http://localhost:3010](http://localhost:3010)

Admin login: `/admin/login` using `SEED_ADMIN_USERNAME` / `SEED_ADMIN_PASSWORD` from `.env`.

Useful commands:

```bash
docker compose ps          # status
docker compose logs -f app # app logs
docker compose down        # stop
```

> If ports `3000` or `5432` are already in use locally, Docker maps the app to **3010** and keeps Postgres internal to the Docker network.

## Project Structure

```
src/
├── app/
│   ├── (public)/       # Public website pages
│   ├── (admin)/        # Admin panel (protected)
│   └── api/            # REST API routes
├── components/         # Shared UI components
├── lib/                # Auth, DB, upload utilities
└── types/              # TypeScript types
```

## Brand Colors

| Token | HEX |
|-------|-----|
| Primary Purple | `#503694` |
| Primary Lime | `#c9da2a` |
| Secondary Yellow | `#ffd400` |
| Secondary Orange | `#ff6633` |
