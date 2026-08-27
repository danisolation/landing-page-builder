# Landing Page Builder — Project Rules

## Project Overview

Landing page builder with two apps:
- **Frontend** (`landing-page-fe/`): Next.js 16 App Router — admin UI + public page rendering
- **Backend** (`landing-page-be/`): NestJS + Prisma 7 — REST API + JWT auth

## Architecture

```
FE (Next.js, port 3001) → HTTP → BE (NestJS, port 3000) → Prisma 7 → PostgreSQL (Docker, port 5432)
```

## Key Decisions

- **Prisma 7** with driver adapter pattern (`@prisma/adapter-pg`) — NOT the traditional query engine
- **Section content is JSON** — FE defines the shape, BE stores it as-is. No schema changes needed for new section types
- **Vietnamese-first** — default locale is `vi`, code comments in BE are Vietnamese
- **No shared types** between FE and BE — each side defines its own

## When Working on This Project

1. Read `PROJECT.md` in root for full context
2. FE rules: see `landing-page-fe/CLAUDE.md`
3. BE rules: see `landing-page-be/CLAUDE.md`
4. Always check both sides when adding a feature that touches API

## Running the Project

```bash
# BE
cd landing-page-be && docker compose up -d && npx prisma migrate dev && npm run start:dev

# FE
cd landing-page-fe && npm run dev
```
