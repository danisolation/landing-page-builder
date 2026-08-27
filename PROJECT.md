# Landing Page Builder — Project Documentation

> Cập nhật: 2026-08-27

## Tổng quan

Dự án là một **Landing Page Builder** — ứng dụng web cho phép admin tạo và quản lý các landing page. Gồm 2 phần:

- **Frontend (FE)**: Next.js 16 App Router — giao diện quản trị + render landing page công khai
- **Backend (BE)**: NestJS + Prisma 7 — REST API cho CRUD pages/sections + xác thực JWT

**Mục tiêu**: Admin đăng nhập → tạo landing page → thêm các section (Hero, Features, CTA) → xem preview trực tiếp → publish cho người dùng cuối xem.

---

## Trạng thái hiện tại

### ✅ Đã hoàn thành

| Feature | FE | BE |
|---|:---:|:---:|
| Đăng nhập JWT | ✅ | ✅ |
| Dashboard — danh sách pages, stats, search, filter, sort | ✅ | ✅ |
| CRUD Pages (tạo/sửa/xóa) | ✅ | ✅ |
| CRUD Sections (tạo/sửa/xóa, 3 loại: Hero, Features, CTA) | ✅ | ✅ |
| Section editor với live preview (split-pane) | ✅ | — |
| Public page render theo slug | ✅ | ✅ |
| i18n (vi/en) cho giao diện quản trị | ✅ | — |
| Responsive layout (sidebar, mobile) | ✅ | — |
| Toast notifications | ✅ | — |
| Confirm dialog (xóa) | ✅ | — |
| Docker PostgreSQL | — | ✅ |
| Seed data (admin + sample page) | — | ✅ |

### ⚠️ Vấn đề cần xử lý

| Vấn đề | Mức độ | Ghi chú |
|---|---|---|
| Page/Section CRUD không có auth guard | 🔴 Cao | Ai cũng có thể tạo/sửa/xóa pages |
| `POST /auth/register` mở — ai cũng tạo được admin | 🔴 Cao | Cần đóng hoặc thêm invite code |
| JWT_SECRET fallback `'default-secret'` | 🔴 Cao | Cần set env var thật |
| Register trả về cả password hash | 🟡 Trung bình | Cần loại bỏ password khỏi response |
| `isPublished` không có UI toggle | 🟡 Trung bình | Field tồn tại nhưng không dùng |
| Không có pagination | 🟡 Trung bình | `findAll` trả về tất cả records |
| Không có TypeScript types cho API response | 🟡 Trung bình | Dùng `any` everywhere |
| API URL hardcoded `localhost:3000` | 🟢 Thấp | Cần dùng env var |
| Public page hardcode tiếng Việt | 🟢 Thấp | Không dùng i18n |

---

## Kiến trúc tổng thể

```
┌─────────────────────────────────────────────────┐
│                    Frontend                       │
│              Next.js 16 (App Router)              │
│                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │  Login   │  │Dashboard │  │ Page Editor  │   │
│  │  Page    │  │  Page    │  │ + Sections   │   │
│  └────┬─────┘  └────┬─────┘  └──────┬───────┘   │
│       │              │               │            │
│       └──────────────┼───────────────┘            │
│                      │                            │
│              ┌───────▼────────┐                   │
│              │   lib/api.ts   │                   │
│              │  fetch wrapper │                   │
│              └───────┬────────┘                   │
└──────────────────────┼────────────────────────────┘
                       │ HTTP (localhost:3000)
┌──────────────────────┼────────────────────────────┐
│                      ▼                            │
│               Backend (NestJS)                    │
│                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │  Auth    │  │  Pages   │  │  Sections    │   │
│  │  Module  │  │  Module  │  │  Module      │   │
│  └────┬─────┘  └────┬─────┘  └──────┬───────┘   │
│       │              │               │            │
│       └──────────────┼───────────────┘            │
│                      │                            │
│              ┌───────▼────────┐                   │
│              │  Prisma 7      │                   │
│              │  (pg adapter)  │                   │
│              └───────┬────────┘                   │
└──────────────────────┼────────────────────────────┘
                       │
              ┌────────▼────────┐
              │  PostgreSQL 16  │
              │   (Docker)      │
              └─────────────────┘
```

---

## Frontend (landing-page-fe/)

### Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.3.2 |
| React | React + React DOM | 19.2.8 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS v4 | ^4 |
| UI Components | shadcn/ui (base-nova style) | ^4.19.0 |
| Component Primitives | @base-ui/react | ^1.7.0 |
| Select | @radix-ui/react-select | ^2.3.7 |
| Data Fetching | TanStack React Query | ^5.102.3 |
| i18n | next-intl | ^4.13.7 |
| Icons | lucide-react | ^1.34.0 |
| Toast | sonner | ^2.0.8 |

### Cấu trúc thư mục

```
src/
├── app/
│   ├── layout.tsx                    # Root layout (Inter font, QueryProvider)
│   ├── page.tsx                      # Redirect / → /vi
│   ├── globals.css                   # Tailwind v4 + shadcn CSS variables
│   └── [locale]/
│       ├── layout.tsx                # Locale layout (NextIntlClientProvider, AppLayout, Toaster)
│       ├── login/page.tsx            # Login page
│       ├── dashboard/page.tsx        # Dashboard — danh sách pages
│       ├── pages/
│       │   ├── new/page.tsx          # Tạo page mới
│       │   └── [id]/edit/page.tsx    # Sửa page + quản lý sections
│       └── [slug]/page.tsx           # Public landing page render
├── components/
│   ├── layout/                       # AppLayout, Breadcrumbs, LanguageSwitcher
│   ├── dashboard/                    # StatsCards, SearchFilter, PageCard
│   ├── sections/                     # SectionEditor, SectionPreview, Hero/Features/CtaSection
│   │   └── editors/                  # HeroEditor, FeaturesEditor, CtaEditor
│   └── ui/                           # shadcn/ui primitives (button, card, input, select, dialog...)
├── hooks/
│   ├── useAuth.ts                    # Login/logout, token management
│   ├── usePages.ts                   # CRUD hooks cho pages (useQuery + useMutation)
│   └── useSections.ts               # CRUD hooks cho sections
├── i18n/
│   ├── routing.ts                    # Locales: ['vi', 'en'], default: 'vi'
│   ├── request.ts                    # Server-side message loading
│   └── navigation.ts                # Locale-aware Link, redirect, useRouter
├── lib/
│   ├── api.ts                        # Centralized fetch wrapper + all API functions
│   └── utils.ts                      # cn() helper (clsx + tailwind-merge)
├── messages/
│   ├── en.json                       # English translations
│   └── vi.json                       # Vietnamese translations
├── providers/
│   └── QueryProvider.tsx             # TanStack Query client provider
└── middleware.ts                      # Locale redirect + auth guard
```

### Routes

| Route | File | Mô tả |
|---|---|---|
| `/` | `app/page.tsx` | Redirect → `/vi` |
| `/{locale}/login` | `app/[locale]/login/page.tsx` | Đăng nhập |
| `/{locale}/dashboard` | `app/[locale]/dashboard/page.tsx` | Dashboard — danh sách pages |
| `/{locale}/pages/new` | `app/[locale]/pages/new/page.tsx` | Tạo page mới |
| `/{locale}/pages/{id}/edit` | `app/[locale]/pages/[id]/edit/page.tsx` | Sửa page + sections |
| `/{locale}/{slug}` | `app/[locale]/[slug]/page.tsx` | Public landing page |

### Patterns & Conventions

- **App Router** với dynamic `[locale]` segment — tất cả routes nằm dưới `[locale]/`
- **Client components** — hầu hết pages/components dùng `"use client"`, chỉ layouts là server components
- **Custom hooks** — `usePages()`, `useSections(pageId)`, `useAuth()` wrap TanStack Query
- **Mutation + invalidation** — mutations invalidate query key tương ứng sau khi thành công
- **shadcn/ui base-nova style** — dùng `@base-ui/react` làm headless base (trừ Select dùng Radix)
- **Global confirm dialog** — Promise-based pattern, `showConfirm()` trả về `Promise<boolean>`
- **Path alias** — `@/*` → `./src/*`
- **Vietnamese-first** — default locale là `vi`, date format dùng `vi-VN`

### Xác thực (FE)

1. Login → POST `/auth/login` → nhận `access_token`
2. Token lưu vào `localStorage` + cookie (cho middleware)
3. Middleware kiểm tra cookie → redirect nếu chưa đăng nhập
4. `fetchAPI()` tự động attach `Authorization: Bearer <token>` cho mọi request
5. Logout → xóa localStorage + cookie → redirect `/login`
6. **Không có refresh token** — token hết hạn thì phải login lại

---

## Backend (landing-page-be/)

### Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | NestJS | ^11.0.1 |
| Language | TypeScript | ^5.7.3 (ES2023, nodenext) |
| ORM | Prisma | ^7.9.1 (driver adapter: @prisma/adapter-pg) |
| Database | PostgreSQL 16 | Docker |
| Auth | Passport + JWT | @nestjs/passport, @nestjs/jwt |
| Password | bcrypt | ^6.0.0 |
| Validation | class-validator + class-transformer | |
| Config | @nestjs/config | ^4.0.4 |

### Cấu trúc thư mục

```
landing-page-be/
├── prisma/
│   ├── schema.prisma                 # Database schema (3 models)
│   ├── seed.ts                       # Seed: admin + sample page + sections
│   └── migrations/                   # 2 migrations (init + add_admin)
├── src/
│   ├── main.ts                       # Bootstrap: CORS, ValidationPipe, port 3000
│   ├── app.module.ts                 # Root module
│   ├── app.controller.ts             # GET / → "Hello World!"
│   ├── prisma/
│   │   ├── prisma.module.ts          # Global module
│   │   └── prisma.service.ts         # PrismaClient + PgAdapter (Prisma 7)
│   ├── auth/
│   │   ├── auth.module.ts            # Passport + JWT
│   │   ├── auth.service.ts           # register, login, getProfile
│   │   ├── auth.controller.ts        # POST /auth/register, /login, GET /profile
│   │   ├── jwt.strategy.ts           # JWT strategy (Bearer token)
│   │   ├── jwt-auth.guard.ts         # AuthGuard('jwt')
│   │   └── dto/login.dto.ts
│   ├── pages/
│   │   ├── pages.module.ts
│   │   ├── pages.controller.ts       # CRUD /pages
│   │   ├── pages.service.ts          # CRUD + findBySlug
│   │   └── dto/                      # CreatePageDto, UpdatePageDto
│   └── sections/
│       ├── sections.module.ts
│       ├── sections.controller.ts    # CRUD /pages/:pageId/sections
│       ├── sections.service.ts       # CRUD scoped to page
│       └── dto/                      # CreateSectionDto, UpdateSectionDto
└── docker-compose.yml                # PostgreSQL 16 container
```

### Database Schema

```prisma
model Page {
  id          String    @id @default(uuid())
  title       String
  slug        String    @unique
  description String?
  isPublished Boolean   @default(false)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  sections    Section[]
}

model Section {
  id        String   @id @default(uuid())
  type      String               // "hero", "features", "cta"
  content   Json                   // Flexible JSON blob
  order     Int
  pageId    String
  page      Page     @relation(fields: [pageId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Admin {
  id        String   @id @default(uuid())
  username  String   @unique
  password  String               // bcrypt hash
  createdAt DateTime @default(now())
}
```

**Relations**: Page 1---* Section (cascade delete). Admin standalone.

### API Endpoints

| Method | Path | Auth | Mô tả |
|---|---|:---:|---|
| GET | `/` | ❌ | Health check |
| POST | `/auth/register` | ❌ | Tạo admin |
| POST | `/auth/login` | ❌ | Login → JWT |
| GET | `/auth/profile` | ✅ | Lấy profile admin |
| POST | `/pages` | ❌ | Tạo page |
| GET | `/pages` | ❌ | List tất cả pages (+ sections) |
| GET | `/pages/slug/:slug` | ❌ | Tìm page theo slug |
| GET | `/pages/:id` | ❌ | Tìm page theo ID |
| PATCH | `/pages/:id` | ❌ | Sửa page |
| DELETE | `/pages/:id` | ❌ | Xóa page (cascade sections) |
| POST | `/pages/:pageId/sections` | ❌ | Tạo section |
| GET | `/pages/:pageId/sections` | ❌ | List sections (ordered) |
| GET | `/pages/:pageId/sections/:id` | ❌ | Lấy 1 section |
| PATCH | `/pages/:pageId/sections/:id` | ❌ | Sửa section |
| DELETE | `/pages/:pageId/sections/:id` | ❌ | Xóa section |

> ⚠️ Chỉ `GET /auth/profile` có JWT guard. Tất cả endpoints khác đều **mở**.

### Patterns & Conventions

- **Prisma 7 driver adapter** — dùng `@prisma/adapter-pg` thay vì built-in query engine
- **Global Prisma module** — `@Global()` decorator, inject ở bất kỳ đâu
- **Nested REST** — sections nằm dưới pages: `/pages/:pageId/sections`
- **Existence check** — service luôn check tồn tại trước update/remove → 404 nếu không tìm thấy
- **UUID primary keys** — tất cả models dùng `@default(uuid())`
- **Vietnamese comments** — code comments viết bằng tiếng Việt
- **ValidationPipe global** — `whitelist: true`, `forbidNonWhitelisted: true`

### Seed Data

Chạy `npx prisma db seed` để tạo:
- Admin: `admin` / `123456`
- Sample page: "My Landing Page" với 3 sections (Hero, Features, CTA)

---

## Chạy dự án

### Backend

```bash
cd landing-page-be

# 1. Start PostgreSQL
docker compose up -d

# 2. Run migrations
npx prisma migrate dev

# 3. Seed data
npx prisma db seed

# 4. Start dev server (port 3000)
npm run start:dev
```

### Frontend

```bash
cd landing-page-fe

# 1. Install dependencies
npm install

# 2. Start dev server (port 3001)
npm run dev
```

Truy cập: `http://localhost:3001/vi/login`
Login: `admin` / `123456`

---

## Tiếp theo nên làm gì

### Ưu tiên cao (Security)

1. **Thêm JWT guard cho Page/Section endpoints** — hiện tại ai cũng có thể CRUD
2. **Đóng hoặc bảo vệ register endpoint** — thêm invite code hoặc chỉ cho phép tạo admin đầu tiên
3. **Set JWT_SECRET env var** — bỏ fallback `'default-secret'`
4. **Loại bỏ password khỏi register response**

### Ưu tiên trung bình (Features)

5. **Thêm publish/unpublish toggle** — `isPublished` field đã có nhưng chưa có UI
6. **Pagination** cho danh sách pages
7. **TypeScript types** cho API responses (Page, Section interfaces)
8. **Thêm section types mới** — Testimonials, Pricing, FAQ, Footer...
9. **Drag-and-drop** cho section ordering
10. **Image upload** cho sections (hero background, feature icons)

### Ưu tiên thấp (Polish)

11. **Environment variables** cho API URL (`.env` file)
12. **i18n cho public page** — hiện tại hardcode tiếng Việt
13. **Token refresh** mechanism
14. **Input sanitization** cho `content` JSON field
15. **Rate limiting** cho API
16. **Logging middleware**

---

## Ghi chú cho Agent

- Dự án dùng **Prisma 7** với driver adapter pattern (`@prisma/adapter-pg`) — khác với Prisma 5/6
- FE dùng **Next.js 16 App Router** — tất cả routes dưới `[locale]/`
- UI library là **shadcn/ui base-nova style** — dùng `@base-ui/react` primitives, không phải Radix (trừ Select)
- Code comments ở BE viết bằng **tiếng Việt**
- Không có shared types giữa FE và BE — mỗi bên tự define
- API base URL hardcoded `http://localhost:3000` trong `src/lib/api.ts`
- CORS chỉ cho phép `http://localhost:3001`
