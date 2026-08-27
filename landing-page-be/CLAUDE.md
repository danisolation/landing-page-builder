# Backend Rules — Landing Page Builder

## Tech Stack

- NestJS 11 + TypeScript (ES2023, nodenext modules)
- Prisma 7.x with `@prisma/adapter-pg` driver adapter
- PostgreSQL 16 (Docker)
- Passport + JWT auth, bcrypt password hashing
- class-validator + class-transformer for DTO validation

## Project Structure

```
src/
├── main.ts                 # Bootstrap: CORS, ValidationPipe, port 3000
├── app.module.ts           # Root module
├── prisma/                 # Global PrismaModule + PrismaService
├── auth/                   # Auth module (register, login, JWT)
├── pages/                  # Pages CRUD module
└── sections/               # Sections CRUD module (nested under pages)
```

## Prisma 7 — IMPORTANT

This project uses **Prisma 7 driver adapter pattern**. This is different from Prisma 5/6.

```typescript
// ✅ Correct — Prisma 7 with driver adapter
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// ❌ Wrong — this is Prisma 5/6 style, do NOT use
const prisma = new PrismaClient({ datasources: { db: { url } } });
```

- `PrismaService` extends `PrismaClient` and creates `PrismaPg` adapter in constructor
- `prisma.config.ts` loads dotenv and sets schema/migrations/seed paths
- Always use the global `PrismaService` via dependency injection

## Module Pattern

Every module follows this structure:
```
module-name/
├── module-name.module.ts       # Module definition
├── module-name.controller.ts   # Route handlers
├── module-name.service.ts      # Business logic
└── dto/
    ├── create-xxx.dto.ts       # Create DTO (required fields)
    └── update-xxx.dto.ts       # Update DTO (all optional)
```

## Conventions

- **UUID primary keys** — all models use `@default(uuid())`
- **Existence checks** — always verify record exists before update/remove, throw 404 if not found
- **Nested REST routes** — sections under pages: `/pages/:pageId/sections`
- **ValidationPipe global** — `whitelist: true`, `forbidNonWhitelisted: true` in `main.ts`
- **CORS** — only allows `http://localhost:3001`
- **Vietnamese comments** — code comments are in Vietnamese
- **No pagination** — `findAll` returns all records (add skip/take when needed)
- **No soft delete** — deletes are hard deletes

## Database Schema

3 models: `Page`, `Section`, `Admin`
- `Page 1---* Section` with cascade delete
- `Admin` is standalone (auth only)
- `Section.content` is `Json` type — flexible, FE defines the shape

## Auth

- JWT via Passport, token expires in 1 day
- `JwtAuthGuard` currently only on `GET /auth/profile`
- Page/Section endpoints are **unguarded** (known security gap, needs fixing)

## Adding a New Feature

1. Create module directory under `src/`
2. Define DTOs with class-validator decorators
3. Service: inject `PrismaService`, implement CRUD
4. Controller: define routes, apply guards if needed
5. Register module in `app.module.ts`
6. Run `npx prisma migrate dev` if schema changed

## Common Commands

```bash
npm run start:dev           # Dev server with hot reload
npx prisma migrate dev      # Run migrations
npx prisma db seed          # Seed database
npx prisma studio           # Open Prisma Studio (DB viewer)
```
