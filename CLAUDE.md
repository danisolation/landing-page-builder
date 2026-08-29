# Landing Page Builder

Monorepo: **FE** (Next.js 16, port 3001) → **BE** (NestJS, port 3000) → PostgreSQL (Docker, port 5432)

## Quick Start

```bash
# Backend
cd landing-page-be
cp .env.example .env          # DATABASE_URL, JWT_SECRET
npm install
docker compose up -d
npx prisma migrate dev
npx prisma db seed            # admin / 123456
npm run start:dev

# Frontend
cd landing-page-fe
npm install
npm run dev
```

Login: `admin` / `123456` at http://localhost:3001/vi/login

## Commands

| Task | Command |
|------|---------|
| FE dev | `cd landing-page-fe && npm run dev` |
| FE build (type-check) | `cd landing-page-fe && npm run build` |
| FE lint | `cd landing-page-fe && npm run lint` |
| FE tests | `cd landing-page-fe && npx playwright test` |
| BE dev | `cd landing-page-be && npm run start:dev` |
| BE migrations | `cd landing-page-be && npx prisma migrate dev` |
| BE seed | `cd landing-page-be && npx prisma db seed` |
| BE studio | `cd landing-page-be && npx prisma studio` |

## Key Decisions

- **Prisma 7** with driver adapter (`@prisma/adapter-pg`) — NOT the traditional query engine
- **Section content is JSON** — FE defines shape, BE stores as-is. No schema changes for new section types
- **5 section types**: `hero`, `features`, `cta`, `stats`, `testimonials`
- **Vietnamese-first** — default locale `vi`, BE code comments in Vietnamese
- **No shared types** between FE and BE — each side defines its own
- **shadcn/ui base-nova style** — `@base-ui/react` primitives, NOT Radix (except Select)

## Detailed Rules

- FE rules: `landing-page-fe/CLAUDE.md` (auto-loads when working in FE)
- BE rules: `landing-page-be/CLAUDE.md` (auto-loads when working in BE)
- Progress tracker: `PROGRESS.md` (read this to understand current state and TODOs)
- **NO Co-Authored-By in commit messages** — do NOT add `Co-Authored-By: Claude` or any similar line
- **Ask before git push** — ALWAYS confirm with user before running `git push`. Commit is OK without asking, but push requires explicit user approval.
