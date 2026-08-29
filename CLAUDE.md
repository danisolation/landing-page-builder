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

## Performance Rules

- **Public pages MUST be Server Components** — fetch data on server, pass to client sub-components. Never use `'use client'` on `[slug]/page.tsx`
- **No framer-motion on public pages** — use CSS transitions + `IntersectionObserver` (`useInView` hook). framer-motion is only for admin modals (lazy-loaded)
- **No double animation** — don't wrap section components in `AnimatedSection` if they already have their own scroll animations
- **TanStack Query: toast at call-site only** — never put `toast.success/error` in mutation hooks (`usePages`, `useSections`), only in call-site callbacks. TanStack merges both levels → duplicate toasts
- **`useRef` for scroll tracking** — never use `useState` for `lastScrollY` in scroll listeners. Use `useRef` to avoid re-registering the event listener on every scroll
- **ISR for public data** — use `next: { revalidate: 60 }` in server-side fetch for public pages

## Detailed Rules

- FE rules: `landing-page-fe/CLAUDE.md` (auto-loads when working in FE)
- BE rules: `landing-page-be/CLAUDE.md` (auto-loads when working in BE)
- Progress tracker: `PROGRESS.md` (read this to understand current state and TODOs)
- **NO Co-Authored-By in commit messages** — do NOT add `Co-Authored-By: Claude` or any similar line
- **No auto commit/push** — ONLY commit or push when user explicitly asks. Do not ask "want to commit?", just wait for user to say so.
- **Reports** — BE work: detailed report explaining WHY + WHAT + HOW. FE work: brief report, enough for user to understand.
- **Always ask when unclear** — never guess. If requirement is ambiguous, ask user before proceeding.
