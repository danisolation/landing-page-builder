# Landing Page Builder

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=flat-square&logo=nestjs)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=flat-square&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker)

Full-stack landing page builder — Create, manage, and publish landing pages with multiple section types.

[Features](#features) • [Tech Stack](#tech-stack) • [Getting Started](#getting-started) • [Architecture](#architecture) • [API Reference](#api-reference) • [Documentation](#documentation)

</div>

---

## Features

### Admin
- **Dashboard** — Overview with stats, search, filter, sort
- **CRUD Pages** — Create, edit, delete landing pages
- **CRUD Sections** — 5 section types with visual editor + live preview
- **Drag & Drop** — Reorder sections via drag and drop
- **Preview** — Preview full page or individual sections
- **i18n** — Vietnamese / English support
- **Dark Mode** — Toggle dark/light mode
- **Responsive** — Mobile + Desktop

### Public
- **Landing Page** — Render sections with scroll animations
- **Animated Sections** — Scroll-triggered fade-in-up
- **Counter Animation** — Animated number counters
- **Dark Mode Toggle** — User-selectable theme

### Backend
- **REST API** — CRUD pages + sections (nested routes)
- **JWT Authentication** — Login, register, token-based auth
- **Auth Guard** — Global guard with `@Public()` decorator
- **Prisma 7** — ORM with driver adapter pattern
- **PostgreSQL 16** — Database (Docker)
- **Validation** — Global ValidationPipe with DTOs
- **Health Check** — `/health` endpoint with DB connectivity check (`@nestjs/terminus`)
- **Graceful Shutdown** — SIGTERM/SIGINT handling + `enableShutdownHooks()`
- **Structured Logging** — Log levels: error > warn > info > debug

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Frontend** | Next.js (App Router) | 16.3.2 |
| **UI Library** | shadcn/ui (base-nova) | ^4.19.0 |
| **Data Fetching** | TanStack React Query | ^5.102.3 |
| **i18n** | next-intl | ^4.13.7 |
| **Forms** | React Hook Form + Zod | ^7.x + ^3.x |
| **Animations** | Framer Motion | ^12.x |
| **Drag & Drop** | @atlaskit/pragmatic-drag-and-drop | ^1.x |
| **Backend** | NestJS | ^11.0.1 |
| **ORM** | Prisma (driver adapter) | ^7.9.1 |
| **Database** | PostgreSQL (Docker) | 16 |
| **Auth** | Passport + JWT + bcrypt | — |
| **Container** | Docker Compose | — |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)

### Installation

```bash
# 1. Clone repository
git clone https://github.com/danisolation/landing-page-builder.git
cd landing-page-builder
```

#### Backend

```bash
cd landing-page-be

# 2. Install dependencies
npm install

# 3. Start PostgreSQL (Docker)
docker compose up -d

# 4. Setup environment variables
cp .env.example .env
# Edit .env if needed (default values work with Docker setup)

# 5. Run database migrations
npx prisma migrate dev

# 6. Seed database (admin + sample data)
npx prisma db seed

# 7. Start development server
npm run start:dev
# → Server running on http://localhost:3000
```

#### Frontend

```bash
cd landing-page-fe

# 8. Install dependencies
npm install

# 9. Start development server
npm run dev
# → Frontend running on http://localhost:3001
```

### Login

Navigate to [http://localhost:3001/vi/login](http://localhost:3001/vi/login)

```
Username: admin
Password: 123456
```

---

## Project Structure

```
landing-page-builder/
├── landing-page-fe/                 # Frontend (Next.js)
│   ├── src/
│   │   ├── app/                     # App Router pages
│   │   │   ├── layout.tsx           # Root layout
│   │   │   ├── page.tsx             # Redirect → /vi
│   │   │   └── [locale]/            # Locale routes (vi/en)
│   │   │       ├── layout.tsx       # Locale layout
│   │   │       ├── login/           # Login page
│   │   │       ├── dashboard/       # Dashboard
│   │   │       ├── pages/           # Pages CRUD
│   │   │       └── [slug]/          # Public landing page
│   │   ├── components/
│   │   │   ├── layout/              # AppLayout, Breadcrumbs
│   │   │   ├── dashboard/           # StatsCards, PageCard, SearchFilter
│   │   │   ├── sections/            # Section renderers + editors
│   │   │   │   └── editors/         # HeroEditor, FeaturesEditor, etc.
│   │   │   ├── public/              # PublicNav, PublicFooter, AnimatedSection
│   │   │   └── ui/                  # shadcn/ui primitives
│   │   ├── hooks/                   # usePages, useSections, useAuth
│   │   ├── i18n/                    # next-intl config
│   │   ├── lib/                     # api.ts, utils.ts
│   │   ├── messages/                # vi.json, en.json
│   │   └── providers/               # QueryProvider
│   └── e2e/                         # Playwright tests
│
├── landing-page-be/                 # Backend (NestJS)
│   ├── src/
│   │   ├── auth/                    # Auth module
│   │   │   ├── auth.controller.ts   # Login, register, profile
│   │   │   ├── auth.service.ts      # Auth business logic
│   │   │   ├── jwt.strategy.ts      # Passport JWT strategy
│   │   │   ├── jwt-auth.guard.ts    # Auth guard with @Public()
│   │   │   └── public.decorator.ts  # @Public() decorator
│   │   ├── pages/                   # Pages module
│   │   │   ├── pages.controller.ts  # CRUD routes
│   │   │   ├── pages.service.ts     # Business logic
│   │   │   └── dto/                 # Validation DTOs
│   │   ├── sections/                # Sections module
│   │   │   ├── sections.controller.ts
│   │   │   ├── sections.service.ts
│   │   │   └── dto/
│   │   ├── prisma/                  # Database
│   │   │   ├── prisma.module.ts     # Global module
│   │   │   └── prisma.service.ts    # PrismaClient + PgAdapter
│   │   ├── main.ts                  # Bootstrap
│   │   └── app.module.ts            # Root module
│   ├── prisma/
│   │   ├── schema.prisma            # Database schema
│   │   ├── seed.ts                  # Seed data
│   │   └── migrations/              # Database migrations
│   └── docker-compose.yml           # PostgreSQL container
│
├── CLAUDE.md                        # AI assistant instructions
├── PROGRESS.md                      # Project progress tracker
├── PROJECT.md                       # Project documentation
├── DOCKER.md                        # Docker guide
├── FULLSTACK-ROADMAP.md             # FE → Fullstack roadmap
├── BE-FUNDAMENTALS.md               # Backend fundamentals
├── ARCHITECTURE.md                  # Architecture deep-dive
├── OPEN-SOURCE-GUIDE.md             # Open source contribution guide
└── reports/                         # Feature reports
    ├── all-features.md              # All features summary
    └── auth-guard-implementation.md # Auth guard detail report
```

---

## Architecture

### Request Flow

```
Client → CORS → JwtAuthGuard → Controller → Service → Prisma → DB
                  │
                  ├── @Public()? → skip auth
                  └── No? → Passport JWT verify → 401 if invalid
```

### Request Lifecycle

```
1. Request arrives → Helmet (security headers)
2. CORS check → reject if origin not allowed
3. ValidationPipe → whitelist + transform DTO
4. ThrottlerGuard → rate limit (30 req/min)
5. JwtAuthGuard → verify token (skip if @Public)
6. Controller → route handler
7. Service → business logic
8. Prisma → database query
9. ResponseInterceptor → wrap in { success, data, timestamp }
10. PrismaExceptionFilter → map Prisma errors to HTTP
```

### Health Check

```
GET /health → { status: "ok", details: { database: { status: "up" } } }
```

Checks Prisma DB connectivity via `@nestjs/terminus`. Public endpoint (no auth required).

---

## Testing

### Strategy

| Layer | Tool | Coverage |
|---|---|---|
| **BE Unit** | Jest + ts-jest | Services (auth, pages, sections) — mocked Prisma |
| **BE E2E** | Jest + Supertest | Full API flow — real PostgreSQL |
| **FE Unit** | Vitest + Testing Library | API client, hooks, section constants |
| **FE E2E** | Playwright | Login, CRUD, public pages, navigation |

### Running Tests

```bash
# Backend unit tests
cd landing-page-be && npm run test

# Backend unit tests with coverage
cd landing-page-be && npm run test:cov

# Backend e2e tests (requires running PostgreSQL)
cd landing-page-be && npm run test:e2e

# Frontend unit tests
cd landing-page-fe && npm run test

# Frontend e2e tests (requires running FE + BE)
cd landing-page-fe && npx playwright test
```

---

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`):

- **Trigger**: Push to `main`, PR to `main`
- **Jobs**:
  - `lint-and-build` — Install deps, lint, build (FE + BE)
  - `test-backend` — PostgreSQL service container, run migrations, seed, unit tests, e2e tests
  - `test-frontend` — Unit tests (Vitest), e2e tests (Playwright)

```yaml
# Simplified flow
lint-and-build → test-backend (with PostgreSQL)
              → test-frontend
```

### Database Schema

```
Page 1───* Section (cascade delete)
Admin (standalone)

Page:      id, title, slug, description, isPublished
Section:   id, type, content (JSON), order, pageId
Admin:     id, username, password (bcrypt)
```

### Section Types

| Type | Content Fields |
|---|---|
| `hero` | heading, subheading, buttonText, buttonLink |
| `features` | title, description, items[] (icon, name, description) |
| `cta` | heading, description, buttonText, buttonLink |
| `stats` | title, items[] (value, label) |
| `testimonials` | title, description, items[] (quote, name, role, avatar) |

---

## API Reference

### Authentication

| Method | Path | Auth | Description |
|---|---|:---:|---|
| `POST` | `/auth/register` | ❌ | Create admin |
| `POST` | `/auth/login` | ❌ | Login → JWT token |
| `GET` | `/auth/profile` | ✅ | Get admin profile |

### Pages

| Method | Path | Auth | Description |
|---|---|:---:|---|
| `POST` | `/pages` | ✅ | Create page |
| `GET` | `/pages` | ✅ | List all pages (+ sections) |
| `GET` | `/pages/:id` | ✅ | Get page by ID |
| `GET` | `/pages/slug/:slug` | ❌ | Get page by slug (public) |
| `PATCH` | `/pages/:id` | ✅ | Update page |
| `DELETE` | `/pages/:id` | ✅ | Delete page (cascade) |

### Sections

| Method | Path | Auth | Description |
|---|---|:---:|---|
| `POST` | `/pages/:pageId/sections` | ✅ | Create section |
| `GET` | `/pages/:pageId/sections` | ✅ | List sections (ordered) |
| `GET` | `/pages/:pageId/sections/:id` | ✅ | Get section |
| `PATCH` | `/pages/:pageId/sections/:id` | ✅ | Update section |
| `DELETE` | `/pages/:pageId/sections/:id` | ✅ | Delete section |

### Request Examples

```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'

# Get pages (with token)
curl http://localhost:3000/pages \
  -H "Authorization: Bearer <token>"

# Get public page by slug
curl http://localhost:3000/pages/slug/san-pham-moi
```

---

## Commands

### Frontend

```bash
cd landing-page-fe

npm run dev           # Dev server (port 3001)
npm run build         # Production build (type-check)
npm run lint          # ESLint
npm run test          # Unit tests (Vitest)
npm run test:watch    # Unit tests (watch mode)
npx playwright test   # E2E tests
```

### Backend

```bash
cd landing-page-be

npm run start:dev      # Dev server with hot reload (port 3000)
npm run test           # Unit tests (Jest)
npm run test:cov       # Unit tests with coverage
npm run test:e2e       # E2E tests (requires DB)
npx prisma migrate dev # Run migrations
npx prisma db seed     # Seed database
npx prisma studio      # Open Prisma Studio (DB viewer)
```

### Docker

```bash
cd landing-page-be

docker compose up -d       # Start PostgreSQL
docker compose down        # Stop PostgreSQL (keep data)
docker compose down -v     # Stop PostgreSQL (delete data)
docker compose logs -f     # View logs
```

---

## Documentation

| Document | Description |
|---|---|
| [`PROJECT.md`](./PROJECT.md) | Project overview, architecture, tech stack |
| [`PROGRESS.md`](./PROGRESS.md) | Progress tracker, known issues |
| [`DOCKER.md`](./DOCKER.md) | Docker guide for this project |
| [`FULLSTACK-ROADMAP.md`](./FULLSTACK-ROADMAP.md) | FE → Fullstack learning roadmap |
| [`BE-FUNDAMENTALS.md`](./BE-FUNDAMENTALS.md) | Backend fundamentals for FE developers |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Architecture deep-dive |
| [`OPEN-SOURCE-GUIDE.md`](./OPEN-SOURCE-GUIDE.md) | Open source contribution guide |
| [`reports/fe-features.md`](./reports/fe-features.md) | Frontend features report |
| [`reports/be-features.md`](./reports/be-features.md) | Backend features report |
| [`reports/auth-guard-implementation.md`](./reports/auth-guard-implementation.md) | Auth guard implementation report |

---

## Environment Variables

### Backend (`.env`)

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/landing_page"

# Auth
JWT_SECRET="your-secret-key-here"

# Server
PORT=3000
```

---

## Roadmap

### ✅ Completed

- [x] NestJS + Prisma 7 + PostgreSQL setup
- [x] CRUD Pages & Sections API
- [x] JWT Authentication
- [x] Next.js 16 frontend with all routes
- [x] Dashboard with stats, search, filter
- [x] Visual section editors (5 types)
- [x] Drag & drop section reordering
- [x] Preview system (full page + per section)
- [x] Public landing page with animations
- [x] i18n (vi/en)
- [x] Dark mode
- [x] Playwright e2e tests
- [x] JWT auth guard with @Public() decorator

### 🚧 In Progress

- [ ] Fix security gaps (register protection, rate limiting)
- [ ] Add pagination
- [ ] TypeScript type improvements (`any` reduction)

### 📋 Planned

- [ ] Image upload for sections
- [ ] More section types (Pricing, FAQ, Footer)
- [ ] Token refresh mechanism
- [ ] Input sanitization
- [ ] Performance optimizations

---

## Contributing

See [`OPEN-SOURCE-GUIDE.md`](./OPEN-SOURCE-GUIDE.md) for detailed contribution guidelines.

```bash
# 1. Fork the repository
# 2. Create feature branch
git checkout -b feat/your-feature

# 3. Commit changes
git commit -m "feat: add your feature"

# 4. Push to branch
git push origin feat/your-feature

# 5. Open Pull Request
```

---

## License

This project is for educational purposes.

---

<div align="center">

**[⬆ Back to top](#landing-page-builder)**

</div>
