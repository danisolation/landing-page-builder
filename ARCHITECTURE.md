# Project Architecture Deep-Dive

> Phân tích chi tiết kiến trúc dự án Landing Page Builder — từ request đến response.

---

## Tổng quan kiến trúc

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                 Next.js 16 (FE)                       │   │
│  │                                                       │   │
│  │  Pages: login, dashboard, pages, edit, sections       │   │
│  │  Hooks: usePages, useSections, useAuth                │   │
│  │  API: fetchAPI() → HTTP requests                      │   │
│  └───────────────────────┬──────────────────────────────┘   │
└──────────────────────────┼──────────────────────────────────┘
                           │ HTTP (localhost:3000)
┌──────────────────────────┼──────────────────────────────────┐
│                          ▼                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                 NestJS 11 (BE)                        │   │
│  │                                                       │   │
│  │  Modules: Auth, Pages, Sections                       │   │
│  │  Guards: JwtAuthGuard (global)                        │   │
│  │  Services: AuthService, PagesService, SectionsService │   │
│  └───────────────────────┬──────────────────────────────┘   │
└──────────────────────────┼──────────────────────────────────┘
                           │ Prisma 7 (driver adapter)
┌──────────────────────────┼──────────────────────────────────┐
│                          ▼                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              PostgreSQL 16 (Docker)                   │   │
│  │                                                       │   │
│  │  Tables: Page, Section, Admin                         │   │
│  │  Volume: postgres_data (persistent)                   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Backend Architecture

### Module Structure

```
src/
├── main.ts                    ← Bootstrap: CORS, ValidationPipe, port
├── app.module.ts              ← Root module: import all modules
├── app.controller.ts          ← Health check: GET /
├── app.service.ts             ← Health check logic
│
├── prisma/                    ← Database layer
│   ├── prisma.module.ts       ← Global module (@Global)
│   └── prisma.service.ts      ← PrismaClient + PgAdapter
│
├── auth/                      ← Authentication module
│   ├── auth.module.ts         ← Module definition + JWT config
│   ├── auth.controller.ts     ← Routes: /auth/login, /auth/register, /auth/profile
│   ├── auth.service.ts        ← Business logic: login, register, getProfile
│   ├── jwt.strategy.ts        ← Passport JWT strategy
│   ├── jwt-auth.guard.ts      ← Auth guard with @Public() support
│   ├── public.decorator.ts    ← @Public() decorator
│   └── dto/
│       └── login.dto.ts       ← Login validation
│
├── pages/                     ← Pages CRUD module
│   ├── pages.module.ts        ← Module definition
│   ├── pages.controller.ts    ← Routes: /pages, /pages/:id, /pages/slug/:slug
│   ├── pages.service.ts       ← Business logic: CRUD + findBySlug
│   └── dto/
│       ├── create-page.dto.ts ← Create validation
│       └── update-page.dto.ts ← Update validation
│
└── sections/                  ← Sections CRUD module
    ├── sections.module.ts     ← Module definition
    ├── sections.controller.ts ← Routes: /pages/:pageId/sections
    ├── sections.service.ts    ← Business logic: CRUD scoped to page
    └── dto/
        ├── create-section.dto.ts
        └── update-section.dto.ts
```

### Request Flow — Chi tiết

```
Client: GET /pages (with JWT token)
    │
    ▼
┌─ main.ts ──────────────────────────────────────────────┐
│  1. CORS check                                          │
│  2. ValidationPipe (cho POST/PATCH)                     │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─ JwtAuthGuard ─────────────────────────────────────────┐
│  3. Reflector check @Public() metadata                  │
│  4. Nếu @Public() → skip auth                           │
│  5. Nếu không → Passport JWT verify token               │
│  6. Token hợp lệ → attach user to request               │
│  7. Token không hợp lệ → throw 401 Unauthorized         │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─ PagesController ──────────────────────────────────────┐
│  8. @Get() → findAll() method                           │
│  9. Call this.pagesService.findAll()                    │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─ PagesService ─────────────────────────────────────────┐
│  10. Call this.prisma.page.findMany()                   │
│  11. Include sections (ordered by order ASC)            │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─ PrismaService ────────────────────────────────────────┐
│  12. PrismaPg adapter → PostgreSQL query                │
│  13. SELECT p.*, s.* FROM pages p                       │
│      LEFT JOIN sections s ON p.id = s."pageId"          │
│      ORDER BY s."order" ASC                             │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─ PostgreSQL ───────────────────────────────────────────┐
│  14. Execute query → return rows                        │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
Response: 200 OK + JSON [{ id, title, slug, sections: [...] }]
```

### Dependency Injection Graph

```
AppModule
├── ConfigModule.forRoot()         ← Load .env
├── PrismaModule (@Global)        ← PrismaService available everywhere
├── AuthModule
│   ├── PassportModule             ← Passport.js integration
│   ├── JwtModule.registerAsync()  ← JWT config (async, use ConfigService)
│   ├── AuthService                ← Business logic
│   ├── AuthController             ← Route handlers
│   └── JwtStrategy               ← Passport JWT strategy
├── PagesModule
│   ├── PagesService               ← Inject PrismaService
│   └── PagesController            ← Inject PagesService
├── SectionsModule
│   ├── SectionsService            ← Inject PrismaService
│   └── SectionsController         ← Inject SectionsService
└── APP_GUARD: JwtAuthGuard        ← Global auth guard
```

### Guard + Decorator Pattern

```
JwtAuthGuard (Global)
    │
    ├── Check @Public() metadata
    │   ├── Yes → skip auth (return true)
    │   └── No → Passport JWT verify
    │
    └── Passport JWT Strategy
        ├── Extract token from Authorization header
        ├── Verify signature with JWT_SECRET
        ├── Check expiration
        └── Call validate() → attach user to request

Routes:
├── POST /auth/login      → @Public() → skip auth
├── POST /auth/register   → @Public() → skip auth
├── GET /                 → @Public() → skip auth
├── GET /pages/slug/:slug → @Public() → skip auth
├── GET /pages            → need token → JwtAuthGuard
├── GET /pages/:id        → need token → JwtAuthGuard
├── POST /pages           → need token → JwtAuthGuard
├── PATCH /pages/:id      → need token → JwtAuthGuard
├── DELETE /pages/:id     → need token → JwtAuthGuard
└── ALL /pages/:pageId/sections/* → need token → JwtAuthGuard
```

---

## Frontend Architecture

### Page Structure

```
app/
├── layout.tsx                    ← Root layout (Inter font, QueryProvider)
├── page.tsx                      ← Redirect / → /vi
└── [locale]/
    ├── layout.tsx                ← Locale layout (NextIntlClientProvider, AppLayout, Toaster)
    │
    ├── login/
    │   ├── page.tsx              ← Login form
    │   ├── loading.tsx           ← Skeleton
    │   └── error.tsx             ← Error boundary
    │
    ├── dashboard/
    │   ├── page.tsx              ← Stats + Pages list
    │   ├── loading.tsx           ← Skeleton
    │   └── error.tsx             ← Error boundary
    │
    ├── pages/
    │   ├── page.tsx              ← Pages list (search, filter, sort)
    │   ├── error.tsx             ← Error boundary
    │   │
    │   ├── new/
    │   │   ├── page.tsx          ← Create page form
    │   │   └── loading.tsx       ← Skeleton
    │   │
    │   └── [id]/
    │       ├── edit/
    │       │   ├── page.tsx      ← Edit page + SectionList
    │       │   └── loading.tsx   ← Skeleton
    │       │
    │       └── sections/
    │           ├── new/
    │           │   ├── page.tsx  ← Add section form
    │           │   └── loading.tsx
    │           │
    │           └── [sectionId]/
    │               ├── edit/
    │               │   ├── page.tsx  ← Edit section form
    │               │   └── loading.tsx
    │
    └── [slug]/
        └── page.tsx              ← Public landing page
```

### Data Flow — FE

```
Component (page.tsx)
    │
    ├── usePages() hook
    │   └── useQuery({ queryKey: ['pages'], queryFn: getPages })
    │       └── getPages() → fetchAPI('/pages')
    │           └── fetch('http://localhost:3000/pages', { headers: { Authorization: 'Bearer ...' } })
    │
    ├── useCreatePage() hook
    │   └── useMutation({ mutationFn: createPage })
    │       └── createPage(data) → fetchAPI('/pages', { method: 'POST', body: data })
    │       └── onSuccess → queryClient.invalidateQueries({ queryKey: ['pages'] })
    │
    └── useAuth() hook
        └── login(data) → loginAPI(username, password)
            └── fetchAPI('/auth/login', { method: 'POST' })
            └── onSuccess → localStorage.setItem('token', token)
                         → document.cookie = `token=${token}`
                         → router.push('/dashboard')
```

### Auth Flow — FE + BE

```
1. User nhập username/password → FE login form
2. FE gọi POST /auth/login → BE
3. BE kiểm tra DB → tạo JWT token → trả về FE
4. FE lưu token vào localStorage + cookie
5. FE redirect → /dashboard
6. FE gọi GET /pages → kèm Authorization: Bearer <token>
7. BE JwtAuthGuard verify token → cho phép truy cập
8. BE trả data → FE render

Logout:
1. User click Logout
2. FE xóa localStorage + cookie
3. FE redirect → /login
4. Mọi request tiếp theo → không có token → 401 → redirect login
```

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────────────┐       ┌─────────────────────┐
│        Page          │       │       Section        │
├─────────────────────┤       ├─────────────────────┤
│ id        UUID (PK) │◄──┐   │ id        UUID (PK) │
│ title     String    │   │   │ type      String    │
│ slug      String    │   │   │ content   Json      │
│ description? String │   │   │ order     Int       │
│ isPublished Boolean │   │   │ pageId    UUID (FK) │──┐
│ createdAt  DateTime │   └───│ page      Page      │  │
│ updatedAt  DateTime │       │ createdAt DateTime  │  │
├─────────────────────┤       │ updatedAt DateTime  │  │
│ sections  Section[] │       └─────────────────────┘  │
└─────────────────────┘                                │
                                                       │
       1 Page ──────────── N Sections (cascade delete)  │
                                                       │
┌─────────────────────┐                                │
│       Admin          │                                │
├─────────────────────┤                                │
│ id        UUID (PK) │                                │
│ username  String    │                                │
│ password  String    │ ← bcrypt hash                  │
│ createdAt DateTime  │                                │
└─────────────────────┘                                │
```

### Section Types — Content Schema

```typescript
// Hero section content
{
  heading: string;
  subheading?: string;
  buttonText?: string;
  buttonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
}

// Features section content
{
  subtitle?: string;
  title: string;
  description?: string;
  items: Array<{
    icon: string;        // Emoji: ⚡ 🔒 💡
    name: string;
    description: string;
  }>;
}

// CTA section content
{
  heading: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
}

// Stats section content
{
  title: string;
  items: Array<{
    value: string;       // "10K+", "99.9%"
    label: string;       // "Khách hàng"
  }>;
}

// Testimonials section content
{
  subtitle?: string;
  title: string;
  description?: string;
  items: Array<{
    quote: string;
    name: string;
    role: string;
    avatar?: string;
  }>;
}
```

---

## Security Architecture

### Current Security Model

```
┌─────────────────────────────────────────────────────────┐
│                    Security Layers                        │
│                                                          │
│  1. CORS (main.ts)                                       │
│     └── Only allow localhost:3001                        │
│                                                          │
│  2. Global ValidationPipe (main.ts)                      │
│     └── whitelist: true → strip unknown fields           │
│     └── forbidNonWhitelisted: true → reject unknown      │
│                                                          │
│  3. JwtAuthGuard (global, APP_GUARD)                     │
│     └── Check @Public() → skip if public                 │
│     └── Verify JWT token → 401 if invalid                │
│                                                          │
│  4. bcrypt (auth.service.ts)                             │
│     └── Hash password before storing                     │
│     └── Compare hash when login                          │
│                                                          │
│  5. Prisma (database layer)                              │
│     └── Parameterized queries → SQL injection safe       │
│                                                          │
│  ⚠️ Known gaps:                                          │
│  - No rate limiting (brute force protection)             │
│  - No input sanitization (XSS in content JSON)           │
│  - Register endpoint open (anyone can create admin)      │
└─────────────────────────────────────────────────────────┘
```

### JWT Flow

```
Login:
Client → POST /auth/login { username, password }
Server → Find admin in DB
Server → bcrypt.compare(password, hash)
Server → Create JWT: { sub: admin.id, username: admin.username }
Server → Sign with JWT_SECRET (expires in 1 day)
Server → Return { access_token: "eyJhbG..." }

Request:
Client → GET /pages + Authorization: Bearer eyJhbG...
JwtAuthGuard → Extract token from header
JwtStrategy → Verify signature with JWT_SECRET
JwtStrategy → Check expiration
JwtStrategy → Call validate(payload) → { id: payload.sub, username: payload.username }
JwtAuthGuard → Attach user to request
Controller → req.user = { id, username }
```

---

## Performance Considerations

### Current Performance

```
✅ Good:
- Prisma 7 driver adapter (direct PostgreSQL connection)
- Sections ordered by index (no sorting overhead)
- Cascade delete (no orphaned records)
- Global PrismaService (singleton, no connection leak)

⚠️ Could improve:
- No pagination (findAll returns all records)
- No caching (every request hits DB)
- No connection pooling configuration
- No database indexing (beyond PK/FK)
```

### Database Indexes

```sql
-- Current indexes (automatic from Prisma):
-- Page.id (PK)
-- Page.slug (UNIQUE)
-- Section.id (PK)
-- Section.pageId (FK)
-- Admin.id (PK)
-- Admin.username (UNIQUE)

-- Could add for performance:
CREATE INDEX idx_pages_created_at ON pages("createdAt" DESC);
CREATE INDEX idx_sections_order ON sections("pageId", "order");
```

---

## File Reference

| File | Purpose | Lines |
|---|---|---|
| `main.ts` | Bootstrap: CORS, ValidationPipe, port | ~20 |
| `app.module.ts` | Root module: imports, APP_GUARD | ~30 |
| `prisma.service.ts` | PrismaClient + PgAdapter | ~25 |
| `auth.module.ts` | JWT config (async, ConfigService) | ~25 |
| `auth.controller.ts` | Login, register, profile routes | ~30 |
| `auth.service.ts` | Login logic, register, getProfile | ~60 |
| `jwt.strategy.ts` | Passport JWT strategy | ~25 |
| `jwt-auth.guard.ts` | Auth guard with @Public() | ~30 |
| `public.decorator.ts` | @Public() decorator | ~5 |
| `pages.controller.ts` | Pages CRUD routes | ~50 |
| `pages.service.ts` | Pages business logic | ~65 |
| `sections.controller.ts` | Sections CRUD routes | ~50 |
| `sections.service.ts` | Sections business logic | ~65 |
