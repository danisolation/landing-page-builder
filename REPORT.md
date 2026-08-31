# Landing Page Builder — Technical Report

> Full-stack monorepo project report. Covers architecture, implementation details, key decisions, and engineering practices across the entire codebase.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture](#3-architecture)
4. [Backend (NestJS)](#4-backend-nestjs)
5. [Frontend (Next.js)](#5-frontend-nextjs)
6. [Database Design](#6-database-design)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [API Design](#8-api-design)
9. [Section System](#9-section-system)
10. [Internationalization (i18n)](#10-internationalization-i18n)
11. [Performance Optimization](#11-performance-optimization)
12. [Testing Strategy](#12-testing-strategy)
13. [CI/CD Pipeline](#13-cicd-pipeline)
14. [Deployment](#14-deployment)
15. [Security](#15-security)
16. [Key Design Decisions](#16-key-design-decisions)

---

## 1. Project Overview

**Landing Page Builder** is a full-stack application that allows administrators to create, manage, and publish landing pages with multiple section types. Public visitors can view the published pages with smooth scroll animations.

### Core Features

- **Admin Dashboard** — Page management with search, filter, sort, stats
- **Section Editor** — 5 section types (hero, features, CTA, stats, testimonials) with visual editors
- **Drag & Drop** — Reorder sections via drag and drop
- **Preview System** — Preview individual sections or full pages before publishing
- **Public Pages** — Server-side rendered landing pages with scroll animations
- **i18n** — Vietnamese and English support
- **Dark Mode** — User-selectable theme

---

## 2. Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | Next.js (App Router) | 16.3.2 | SSR/ISR, routing, React Server Components |
| **UI Library** | shadcn/ui (base-nova) | ^4.19.0 | Accessible, composable UI primitives |
| **Data Fetching** | TanStack React Query | ^5.102.3 | Server state management, caching |
| **i18n** | next-intl | ^4.13.7 | Internationalization (vi/en) |
| **Forms** | React Hook Form + Zod | ^7.x + ^3.x | Form handling + schema validation |
| **Drag & Drop** | @atlaskit/pragmatic-drag-and-drop | ^3.0.0 | Accessible drag and drop |
| **Backend** | NestJS | ^11.0.1 | Enterprise-grade Node.js framework |
| **ORM** | Prisma 7 (driver adapter) | ^7.9.1 | Type-safe database access |
| **Database** | PostgreSQL | 16 | Relational database |
| **Auth** | Passport + JWT + bcrypt | — | Token-based authentication |
| **Container** | Docker Compose | — | Local PostgreSQL setup |
| **Testing** | Jest + Vitest + Playwright | — | Unit, integration, and E2E tests |
| **CI/CD** | GitHub Actions | — | Automated testing and build |
| **Deployment** | Vercel (FE) + Render (BE) | — | Production hosting |

---

## 3. Architecture

### Monorepo Structure

```
landing-page-builder/
├── landing-page-fe/          # Frontend (Next.js 16)
│   ├── src/
│   │   ├── app/              # App Router pages
│   │   ├── components/       # UI components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # API client, utilities
│   │   ├── messages/         # i18n translations (vi.json, en.json)
│   │   └── providers/        # React Query provider
│   └── e2e/                  # Playwright tests
│
├── landing-page-be/          # Backend (NestJS)
│   ├── src/
│   │   ├── auth/             # Authentication module
│   │   ├── pages/            # Pages CRUD module
│   │   ├── sections/         # Sections CRUD module
│   │   ├── health/           # Health check endpoint
│   │   ├── prisma/           # Database service
│   │   └── common/           # Filters, interceptors
│   ├── prisma/               # Schema, migrations, seed
│   └── test/                 # E2E tests
│
├── .github/workflows/ci.yml  # GitHub Actions CI
├── vercel.json               # Vercel deploy config
└── CLAUDE.md                 # AI assistant instructions
```

### Request Lifecycle

```
Request → Helmet (security headers)
        → CORS check
        → ValidationPipe (DTO validation)
        → ThrottlerGuard (rate limiting: 30 req/min)
        → JwtAuthGuard (token verification, skip if @Public)
        → Controller → Service → Prisma → PostgreSQL
        → ResponseInterceptor (wrap in { success, data, timestamp })
        → PrismaExceptionFilter (map Prisma errors to HTTP)
```

### Key Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| **No shared types between FE/BE** | Each side evolves independently, reduces coupling |
| **Schemaless JSON for section content** | Adding new section types requires zero database changes |
| **Global auth guard with @Public() opt-out** | Secure by default — every route is protected unless explicitly marked public |
| **Response envelope** | Consistent API response format: `{ success, data, timestamp }` |
| **ISR for public pages** | Balance between freshness (60s revalidation) and performance |

---

## 4. Backend (NestJS)

### Module Structure

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate }),  // Env validation
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 30 }]), // Rate limiting
    PrismaModule,      // Database (global)
    PagesModule,       // Pages CRUD
    SectionsModule,    // Sections CRUD (nested under pages)
    AuthModule,        // JWT authentication
    HealthModule,      // Health check endpoint
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },    // Global auth
    { provide: APP_GUARD, useClass: ThrottlerGuard },  // Global rate limit
  ],
})
export class AppModule {}
```

### Bootstrap Process (`main.ts`)

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());                          // Security headers
  app.enableCors({ origin: FRONTEND_URL });   // CORS
  app.useGlobalPipes(new ValidationPipe({     // DTO validation
    whitelist: true,           // Strip unknown properties
    forbidNonWhitelisted: true, // Reject unknown properties
    transform: true,           // Auto-transform payloads to DTO instances
  }));
  app.useGlobalFilters(new PrismaExceptionFilter());  // Error handling
  app.useGlobalInterceptors(
    new LoggingInterceptor(),   // Request logging
    new ResponseInterceptor(),  // Response wrapping
  );

  // Swagger at /api/docs
  SwaggerModule.setup('api/docs', app, document);

  app.enableShutdownHooks();  // Graceful shutdown
  await app.listen(PORT);
}
```

### Environment Validation

Uses `class-validator` decorators to validate env vars at startup:

```typescript
class EnvironmentVariables {
  @IsOptional() @IsEnum(['development', 'production', 'test'])
  NODE_ENV?: string;

  @IsString() DATABASE_URL!: string;
  @IsString() JWT_SECRET!: string;
}
```

**Fail-fast pattern**: App crashes immediately if required env vars are missing — no silent failures in production.

### Health Check

```typescript
@Public()
@Get()
@HealthCheck()
check() {
  return this.health.check([
    () => this.prismaHealth.pingCheck('database', this.prisma),
  ]);
}
// GET /health → { status: "ok", details: { database: { status: "up" } } }
```

Uses `@nestjs/terminus` to verify PostgreSQL connectivity. Public endpoint (no auth required) — used by load balancers and monitoring.

### Error Handling

**PrismaExceptionFilter** maps Prisma error codes to user-friendly HTTP responses:

| Prisma Code | HTTP Status | Message |
|-------------|-------------|---------|
| P2000 | 400 Bad Request | Data too long for this field |
| P2001 | 404 Not Found | Record not found |
| P2002 | 409 Conflict | Record already exists (duplicate slug or username) |
| P2003 | 400 Bad Request | Invalid foreign key reference |
| P2014 | 400 Bad Request | Required relation missing |
| P2025 | 404 Not Found | Record not found for update/delete |

Unknown errors return `500 Internal Server Error` without exposing stack traces.

### Graceful Shutdown

```typescript
app.enableShutdownHooks();
process.on('SIGTERM', () => logger.warn('SIGTERM received — shutting down gracefully'));
process.on('SIGINT', () => logger.warn('SIGINT received — shutting down gracefully'));
```

Ensures in-flight requests complete and database connections close cleanly.

### Logging

Structured logging with NestJS built-in `Logger`:

| Level | Usage |
|-------|-------|
| `debug` | CRUD operations, internal state |
| `log` | Request completion, successful operations |
| `warn` | Login failures, not-found records |
| `error` | Unhandled exceptions |

Every HTTP request is logged with method, URL, and elapsed time via `LoggingInterceptor`.

---

## 5. Frontend (Next.js)

### Routing Architecture

```
[locale]/                    # Locale wrapper (vi/en)
├── login/                   # Login page (Client Component)
├── dashboard/               # Dashboard with stats (Client Component)
├── pages/                   # Pages list (Client Component)
│   ├── new/                 # Create page form
│   └── [id]/
│       ├── edit/            # Edit page + section list
│       └── sections/
│           ├── new/         # Create section
│           └── [sectionId]/edit/  # Edit section
└── [slug]/                  # PUBLIC landing page (Server Component)
```

### Public Page — Server Component Pattern

```typescript
// [slug]/page.tsx — Server Component
export default async function PublicPage({ params }) {
  const { slug } = await params;
  const page = await getPublicPageBySlug(slug);  // Server-side fetch
  if (!page) notFound();
  return <PublicPageClient page={page} />;  // Pass data to client
}
```

**Why this matters:**
- Data fetched on server → no client-side waterfall
- ISR with 60-second revalidation → fresh content without SSR overhead
- HTML rendered on server → SEO-friendly
- Client component only handles interactions (dark mode toggle, scroll animations)

### Client-Side Data Flow

```
Server Component (page.tsx)
  → fetches data via server-api.ts (no auth, ISR)
  → passes data as props to PublicPageClient (client component)
  → renders sections with IntersectionObserver animations
```

For admin pages:
```
Client Component → TanStack Query → api.ts (fetchAPI with JWT) → Backend
```

### API Client (`lib/api.ts`)

```typescript
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  if (!res.ok) throw new Error((await res.json()).message);

  const json: ApiResponse<T> = await res.json();
  return json.data;  // Unwrap response envelope
}
```

- Auto-injects JWT token from localStorage
- Unwraps `{ success, data, timestamp }` envelope
- Throws on non-2xx responses with server error message

### Server-Side API (`lib/server-api.ts`)

```typescript
export async function getPublicPageBySlug(slug: string): Promise<Page | null> {
  const res = await fetch(`${API_URL}/pages/slug/${slug}`, {
    next: { revalidate: 60 },  // ISR: revalidate every 60s
  });
  if (!res.ok) return null;
  return (await res.json()).data;
}
```

- No auth tokens (public endpoint)
- Uses Next.js `fetch` cache with `revalidate: 60`
- Graceful error handling → returns null → triggers `notFound()`

### Middleware

The middleware handles three concerns:

1. **Locale routing** — Redirects `/path` → `/vi/path` (default locale)
2. **Auth guard** — Redirects unauthenticated users to `/login` for protected routes
3. **Route classification** — Public routes (login, [slug]) vs protected routes (dashboard, pages)

```typescript
// Simplified logic
if (!token && !isPublicRoute) → redirect to /login
if (token && isLoginPage) → redirect to /dashboard
if (isRootPage) → redirect to /dashboard or /login
```

### State Management

**TanStack Query** for server state:

```typescript
// Query key factory
export const pageKeys = {
  all: ['pages'] as const,
  detail: (id: string) => ['pages', id] as const,
};

// Hook with cache invalidation
const createMutation = useMutation({
  mutationFn: createPage,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: pageKeys.all });
  },
});
```

- 60-second stale time (matches ISR)
- No refetch on window focus (admin-only, controlled environment)
- Toast notifications at call-site only (avoids duplicates with TanStack)

---

## 6. Database Design

### Schema

```prisma
model Page {
  id          String   @id @default(uuid())
  title       String
  slug        String   @unique
  description String?
  isPublished Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  sections    Section[]
}

model Section {
  id        String @id @default(uuid())
  type      String           // "hero" | "features" | "cta" | "stats" | "testimonials"
  content   Json             // Schemaless JSON — shape defined by FE
  order     Int              // Display order
  pageId    String
  page      Page   @relation(fields: [pageId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Admin {
  id        String   @id @default(uuid())
  username  String   @unique
  password  String   // bcrypt hashed
  createdAt DateTime @default(now())
}
```

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **UUID primary keys** | No sequential ID guessing, safe for distributed systems |
| **JSON content for sections** | Adding new section types requires zero migrations |
| **`order` field on sections** | Explicit ordering, not dependent on creation order |
| **Cascade delete** | Deleting a page removes all its sections automatically |
| **`isPublished` flag** | Draft/publish workflow without separate table |

### Prisma 7 Driver Adapter

```typescript
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    super({ adapter });
  }
}
```

Uses `@prisma/adapter-pg` instead of the traditional query engine — direct PostgreSQL connection via `pg` driver for better performance and smaller bundle.

---

## 7. Authentication & Authorization

### Flow

```
1. POST /auth/login { username, password }
2. Service validates credentials (bcrypt.compare)
3. Returns JWT token { sub: adminId, username }
4. Client stores token in localStorage + cookie
5. Subsequent requests include Authorization: Bearer <token>
6. JwtStrategy validates token and attaches user to request
```

### JWT Strategy

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload) {
    return { id: payload.sub, username: payload.username };
  }
}
```

### Global Auth Guard

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }
}
```

Registered as `APP_GUARD` — all routes protected by default. Controllers opt out with `@Public()` decorator.

### Rate Limiting

| Endpoint | Limit | TTL |
|----------|-------|-----|
| Global | 30 req/min | 60s |
| Auth (login/register) | 5 req/min | 60s |

---

## 8. API Design

### Response Envelope

All responses wrapped by `ResponseInterceptor`:

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-08-31T10:00:00.000Z"
}
```

Error responses:

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Page with id \"abc\" not found",
  "timestamp": "2026-08-31T10:00:00.000Z",
  "path": "/pages/abc"
}
```

### Endpoints

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| POST | `/auth/register` | ❌ | Create admin account |
| POST | `/auth/login` | ❌ | Login → JWT token |
| GET | `/auth/profile` | ✅ | Get current admin profile |
| POST | `/pages` | ✅ | Create page |
| GET | `/pages` | ✅ | List all pages with sections |
| GET | `/pages/:id` | ✅ | Get page by ID |
| GET | `/pages/slug/:slug` | ❌ | Get page by slug (public) |
| PATCH | `/pages/:id` | ✅ | Update page |
| DELETE | `/pages/:id` | ✅ | Delete page (cascade) |
| POST | `/pages/:pageId/sections` | ✅ | Create section |
| GET | `/pages/:pageId/sections` | ✅ | List sections (ordered) |
| GET | `/pages/:pageId/sections/:id` | ✅ | Get section |
| PATCH | `/pages/:pageId/sections/:id` | ✅ | Update section |
| DELETE | `/pages/:pageId/sections/:id` | ✅ | Delete section |
| GET | `/health` | ❌ | Health check with DB ping |

### Nested Resource Pattern

Sections are nested under pages:

```
/pages/:pageId/sections
```

This enforces the relationship at the API level — you can't create a section without a valid pageId.

---

## 9. Section System

### Architecture

```
section-constants.ts  →  Registry of all section types
  ├── defaultContent    →  Default empty content for each type
  ├── sectionEditors    →  Editor component for each type
  └── sectionTypes      →  Array of valid type strings
```

### Section Types

| Type | Content Shape |
|------|--------------|
| `hero` | heading, subheading, buttonText, buttonLink, secondaryButtonText, secondaryButtonLink |
| `features` | subtitle, title, description, items[](icon, name, description) |
| `cta` | heading, description, buttonText, buttonLink, secondaryButtonText, secondaryButtonLink |
| `stats` | title, items[](value, suffix, label) |
| `testimonials` | subtitle, title, description, items[](quote, name, role, avatar) |

### Schemaless Content

Section content is stored as JSON in the database:

```json
{
  "heading": "Welcome to Our Platform",
  "subheading": "Build amazing landing pages",
  "buttonText": "Get Started",
  "buttonLink": "#pricing"
}
```

**Why JSON?** Adding a new section type (e.g., pricing, FAQ) requires:
1. Create editor component in FE
2. Create renderer component in FE
3. Register in `section-constants.ts`

**Zero database changes.** The BE stores whatever JSON the FE sends.

### Drag & Drop Reordering

Uses `@atlaskit/pragmatic-drag-and-drop`:

```typescript
// SectionList.tsx
useEffect(() => {
  return monitorForElements({
    canMonitor: ({ source }) => source.data?.type === 'section-card',
    onDrop: ({ source, location }) => {
      const newOrder = reorder({ list: current, startIndex, finishIndex });
      onReorder(newOrder.map(s => s.id));  // Persist to backend
    },
  });
}, [onReorder]);
```

- Global drag monitor registered once
- Ref-based callback pattern (avoids stale closures)
- Drop indicators show valid drop positions

---

## 10. Internationalization (i18n)

### Setup

- **Library**: `next-intl`
- **Locales**: `vi` (default), `en`
- **Translation files**: `src/messages/vi.json`, `src/messages/en.json`

### Routing

```
/vi/dashboard    → Vietnamese dashboard
/en/dashboard    → English dashboard
/                → Redirects to /vi (default locale)
```

### Usage in Components

```typescript
const t = useTranslations('pages');
<h1>{t('title')}</h1>           // "Pages" or "Trang"
<p>{t('noPagesDesc')}</p>       // Context-specific translations
```

### Namespace Structure

```json
{
  "common": { "loading": "...", "save": "...", "cancel": "..." },
  "nav": { "dashboard": "...", "pages": "..." },
  "pages": { "title": "...", "createPage": "...", "deleteSuccess": "..." },
  "login": { "title": "...", "loginFailed": "..." },
  "sectionEditor": { "heading": "...", "subheading": "..." },
  "error": { "title": "...", "message": "...", "retry": "..." }
}
```

---

## 11. Performance Optimization

### Public Pages (SSR + ISR)

```typescript
// Server-side fetch with ISR
const res = await fetch(`${API_URL}/pages/slug/${slug}`, {
  next: { revalidate: 60 },  // Revalidate every 60 seconds
});
```

- HTML rendered on server → fast FCP
- Cached for 60 seconds → reduces server load
- Background revalidation → stale content served while refreshing

### No framer-motion on Public Pages

```typescript
// AnimatedSection uses CSS + IntersectionObserver, NOT framer-motion
export default function AnimatedSection({ children }) {
  const { ref, isInView } = useInView();
  return (
    <div ref={ref} className={`transition-all duration-700 ${
      isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`}>
      {children}
    </div>
  );
}
```

**Why?** framer-motion adds ~30KB gzipped to the bundle. CSS transitions + IntersectionObserver achieve the same visual effect with zero JS overhead on public pages.

### Lazy Loading

```typescript
const SectionPreviewModal = lazy(() => import('./SectionPreviewModal'));
const FullPagePreview = lazy(() => import('./FullPagePreview'));

// In JSX
<Suspense fallback={<Skeleton />}>
  <SectionPreviewModal />
</Suspense>
```

Preview modals loaded on-demand → smaller initial bundle.

### Scroll Performance

```typescript
// useRef for scroll tracking — NOT useState
const lastScrollYRef = useRef(0);

useEffect(() => {
  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    setHidden(currentScrollY > lastScrollYRef.current && currentScrollY > 200);
    lastScrollYRef.current = currentScrollY;
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```

**Why useRef?** `useState` for `lastScrollY` would cause a re-render on every scroll event. `useRef` updates the value without triggering renders.

---

## 12. Testing Strategy

### Test Pyramid

```
         ┌─────────┐
         │  E2E    │  Playwright (FE) + Supertest (BE)
         │ 3 tests │  Full API flow with real DB
        ┌┴─────────┴┐
        │ Integration│  (planned)
        │            │
       ┌┴────────────┴┐
       │   Unit Tests  │  Jest (BE) + Vitest (FE)
       │   46 tests    │  Mocked dependencies
       └──────────────┘
```

### BE Unit Tests (Jest)

**26 tests** across 4 suites:

| Suite | Tests | What's tested |
|-------|-------|---------------|
| `auth.service.spec.ts` | 6 | Register, login, bcrypt, JWT, profile |
| `pages.service.spec.ts` | 10 | CRUD operations, not-found errors |
| `sections.service.spec.ts` | 10 | CRUD operations, page validation |
| `app.controller.spec.ts` | 1 | Hello World endpoint |

**Pattern**: Mock PrismaService, test business logic in isolation.

```typescript
const module = await Test.createTestingModule({
  providers: [
    AuthService,
    { provide: PrismaService, useValue: prisma },  // Mock
    { provide: JwtService, useValue: jwt },          // Mock
  ],
}).compile();
```

### BE E2E Tests (Supertest)

**3 test files** with real PostgreSQL:

| File | Tests | Flow |
|------|-------|------|
| `auth.e2e-spec.ts` | 8 | Register → Login → Profile |
| `pages.e2e-spec.ts` | 8 | Login → Create → Read → Update → Public → Delete |
| `sections.e2e-spec.ts` | 6 | Login → Create page → CRUD sections → Cleanup |

**Key**: Uses shared `test-app.helper.ts` that overrides ThrottlerGuard for tests.

```typescript
export async function createTestApp(): Promise<INestApplication> {
  const module = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(APP_GUARD)
    .useClass(NoThrottleGuard)  // Disable rate limiting in tests
    .compile();
  // ... apply pipes, filters, interceptors
}
```

### FE Unit Tests (Vitest)

**20 tests** across 3 suites:

| Suite | Tests | What's tested |
|-------|-------|---------------|
| `api.test.ts` | 14 | API client: auth, pages, sections, error handling |
| `section-constants.test.ts` | 4 | Section type registry, default content shapes |
| `useInView.test.ts` | 2 | Hook export verification |

**Pattern**: Mock `fetch`, test API client functions.

```typescript
vi.stubGlobal('fetch', mockFetch);
mockFetch.mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ success: true, data: [...], timestamp: '' }),
});
const result = await getPages();
expect(result).toEqual([...]);
```

---

## 13. CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
Trigger: push to main, PR to main

Jobs:
  1. Lint & Build
     ├── Install BE deps → prisma generate → nest build
     └── Install FE deps → eslint → next build

  2. Backend Unit Tests (needs: lint-and-build)
     └── jest --coverage

  3. Frontend Unit Tests (needs: lint-and-build)
     └── vitest run

  4. Backend E2E Tests (needs: lint-and-build)
     ├── PostgreSQL service container
     ├── prisma migrate deploy
     ├── prisma db seed
     └── jest --config ./test/jest-e2e.json
```

### Pipeline Flow

```
Push to main
  → lint-and-build (parallel: BE build + FE lint + FE build)
    → test-backend (parallel with test-frontend and test-e2e)
    → test-frontend
    → test-e2e (with PostgreSQL)
```

### Key CI Decisions

| Decision | Rationale |
|----------|-----------|
| **Node 24** | Node 20 deprecated on GitHub Actions |
| **`--legacy-peer-deps`** | Monorepo dependency resolution conflicts |
| **Prisma generate before build** | NestJS build needs generated Prisma client types |
| **Separate e2e job** | Needs PostgreSQL service container, can't share with unit tests |
| **No FE Playwright in CI** | Requires both FE + BE servers running simultaneously — complex setup |

---

## 14. Deployment

### Frontend — Vercel

```json
// vercel.json
{
  "buildCommand": "cd landing-page-fe && npm install && npm run build",
  "outputDirectory": "landing-page-fe/.next"
}
```

- **Root `package.json`** with `vercel-build` script for monorepo support
- **`outputDirectory`** points to `landing-page-fe/.next` (not root `.next`)
- Automatic deploys on push to `main`
- ISR handled by Vercel's edge network

### Backend — Render

```yaml
# render.yaml
services:
  - type: web
    buildCommand: npm install && prisma generate && nest build
    startCommand: prisma migrate deploy && node dist/src/main
    envVars:
      - DATABASE_URL (from managed PostgreSQL)
      - JWT_SECRET (auto-generated)
      - FRONTEND_URL (Vercel domain)
```

- **Managed PostgreSQL** — Render provisions and manages the database
- **Auto-deploy** on push to `main`
- **Free tier** — sufficient for portfolio/demo

### Local Development

```bash
# Terminal 1: Database
cd landing-page-be && docker compose up -d

# Terminal 2: Backend
cd landing-page-be && npm run start:dev  # Port 3000

# Terminal 3: Frontend
cd landing-page-fe && npm run dev        # Port 3001
```

---

## 15. Security

### Measures

| Layer | Implementation |
|-------|---------------|
| **Security Headers** | `helmet` — clickjacking, XSS, MIME sniffing protection |
| **CORS** | Configurable via `FRONTEND_URL` env var, no hardcoded origins |
| **Input Validation** | Global `ValidationPipe` with `whitelist: true` (strips unknown fields) |
| **Rate Limiting** | 30 req/min global, 5 req/min for auth endpoints |
| **Password Hashing** | bcrypt with 10 rounds |
| **JWT** | Bearer token in Authorization header, validated on every request |
| **Error Exposure** | Unknown errors return generic message — no stack traces leaked |
| **SQL Injection** | Prisma ORM parameterizes all queries |

### Auth Flow Security

```
Password → bcrypt.hash(password, 10) → stored in DB
Login → bcrypt.compare(password, hash) → JWT signed with JWT_SECRET
Request → ExtractJwt.fromAuthHeaderAsBearerToken() → verify signature
```

- Passwords never returned in API responses
- JWT secret validated at startup (fail-fast if missing)
- Token stored in both localStorage (client) and cookie (middleware)

---

## 16. Key Design Decisions

### 1. Schemaless JSON for Section Content

**Decision**: Store section content as JSON instead of typed columns.

**Trade-off**:
- ✅ Adding new section types = zero migrations
- ✅ FE controls the data shape
- ❌ No database-level validation of content
- ❌ Can't query specific content fields efficiently

**Verdict**: Correct for this use case. Section content is write-once, read-many, and always fetched as a whole.

### 2. No Shared Types Between FE and BE

**Decision**: Each side defines its own TypeScript interfaces.

**Trade-off**:
- ✅ Independent deployment and evolution
- ✅ No build dependency between sides
- ❌ Type drift possible (e.g., FE expects field X, BE doesn't return it)

**Verdict**: Acceptable for a two-team or solo project. Would switch to shared types (e.g., `tRPC` or shared package) for larger teams.

### 3. Global Auth Guard with @Public() Opt-Out

**Decision**: All routes protected by default, opt out with `@Public()`.

**Alternative**: Protect routes individually with `@UseGuards(JwtAuthGuard)`.

**Why**: Security by default. New endpoints are automatically protected. Developers must explicitly make endpoints public — intentional action, not accidental omission.

### 4. CSS Animations Over framer-motion for Public Pages

**Decision**: Use CSS transitions + IntersectionObserver for public page animations.

**Why**: framer-motion adds ~30KB to the bundle. Public pages are viewed by end users who may be on slow connections. CSS animations achieve the same visual effect with zero JavaScript overhead.

### 5. ISR with 60-Second Revalidation

**Decision**: Use Incremental Static Regeneration for public pages.

**Why**: Balance between:
- Freshness (content updates within 60 seconds)
- Performance (serves cached HTML, no server rendering per request)
- Cost (reduces database queries on Vercel)

---

## Summary

| Metric | Value |
|--------|-------|
| **Total source files** | ~80 |
| **BE unit tests** | 26 |
| **FE unit tests** | 20 |
| **BE e2e tests** | 22 (across 3 files) |
| **API endpoints** | 15 |
| **Section types** | 5 |
| **i18n locales** | 2 (vi, en) |
| **CI jobs** | 4 (lint-build, test-backend, test-frontend, test-e2e) |
| **Deployment targets** | 2 (Vercel FE, Render BE) |

---

*Report generated for portfolio documentation. Last updated: August 2026.*
