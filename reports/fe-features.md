# Báo cáo Frontend — Tất cả tính năng

> Tech: Next.js 16, React 19, TypeScript, Tailwind v4, shadcn/ui, TanStack Query, next-intl, Framer Motion
> Thời gian: 2026-08-20 → 2026-08-29

---

## Tổng quan

Frontend là giao diện quản trị cho admin + landing page công khai cho người dùng cuối. Xây dựng với Next.js 16 App Router, tất cả routes nằm dưới `[locale]/` (vi/en).

---

## Tính năng theo thứ tự phát triển

### 1. Next.js App Router Setup (2026-08-20)

**Commit**: `973ce9e`

Setup ban đầu với Next.js 16 App Router + React 19 + TypeScript + Tailwind v4.

**Routing** (tất cả dưới `[locale]/`):
```
/login                                    → Đăng nhập
/dashboard                                → Dashboard
/pages                                    → Pages list
/pages/new                                → Tạo page
/pages/[id]/edit                          → Sửa page + sections
/pages/[id]/sections/new                  → Thêm section
/pages/[id]/sections/[sectionId]/edit     → Sửa section
/[slug]                                   → Public landing page
```

---

### 2. TanStack Query + Data Fetching (2026-08-20)

**Commit**: `aafb017`

Hệ thống data fetching với TanStack Query, custom hooks wrap API calls.

**Hooks**:
- `usePages()` — List pages, create, update, delete + auto invalidate
- `useSections(pageId)` — CRUD sections scoped to page + auto invalidate
- `useAuth()` — Login, logout, token management

**API Client** (`lib/api.ts`):
- `fetchAPI()` — Centralized fetch wrapper
- Auto attach `Authorization: Bearer <token>` header
- Handle errors consistently

---

### 3. Auth Flow + Middleware (2026-08-20)

**Commit**: `b11a236`

Hệ thống xác thực phía frontend.

**Flow**:
```
1. Login → POST /auth/login → access_token
2. Token lưu vào localStorage + cookie
3. Middleware kiểm tra cookie → redirect nếu chưa đăng nhập
4. fetchAPI() tự attach Authorization header
5. Logout → xóa localStorage + cookie → redirect /login
```

**Middleware** (`middleware.ts`):
- Locale redirect (root `/` → `/vi`)
- Auth guard (protected routes → redirect login nếu không có token)
- Public routes: login, `[slug]`

---

### 4. UI Components + Layout (2026-08-21)

**Commits**: `22d7598`, `7cb6925`

Hệ thống UI components dựa trên shadcn/ui base-nova style.

**Layout Components**:
- `AppLayout` — Fixed header + sidebar + main content area
- `Breadcrumbs` — Auto-generated từ URL path
- `LanguageSwitcher` — Chuyển đổi vi/en

**UI Primitives** (12 components):
- Button, Card, Input, Textarea, Label, Select
- Dialog, AlertDialog, ConfirmDialog
- EmptyState, Loading, FieldHint

**Notifications**:
- `Toaster` — Sonner toast (success, error, info)
- `ConfirmDialog` — Promise-based confirm pattern

---

### 5. Dashboard (2026-08-21 → 2026-08-26)

**Commits**: `b05e3b9`, `060d150`

Dashboard với tổng quan pages, stats, search, filter, sort.

**Components**:
- `StatsCards` — Tổng pages, published, draft, sections
- `SearchFilter` — Tìm kiếm theo keyword, filter theo status, sort
- `PageCard` — Hiển thị page info với actions (edit, delete)
- `PageTable` — Table view với card/table toggle

**Features**:
- Real-time search
- Filter: All / Published / Draft
- Sort: Newest / Oldest / Name A-Z
- Delete with confirm dialog
- Toast notifications

---

### 6. Visual Section Editor (2026-08-21)

**Commit**: `b0e0134`

Editor cho từng loại section với form inputs.

**5 Section Types**:
| Type | Editor | Fields |
|---|---|---|
| `hero` | HeroEditor | heading, subheading, buttonText, buttonLink, secondaryButton* |
| `features` | FeaturesEditor | title, description, items[] (icon, name, description) |
| `cta` | CtaEditor | heading, description, buttonText, buttonLink, secondaryButton* |
| `stats` | StatsEditor | title, items[] (value, suffix, label) |
| `testimonials` | TestimonialsEditor | title, description, items[] (quote, name, role, avatar) |

**Pattern**:
```
section-constants.ts    ← Registry: types, defaultContent, sectionEditors
editors/HeroEditor.tsx  ← Form inputs cho hero section
HeroSection.tsx         ← Renderer cho public page
SectionPreview.tsx      ← Renderer cho admin preview
```

---

### 7. i18n Support (2026-08-22 → 2026-08-28)

**Commits**: `54799f1`, `67e96c7`

Hỗ trợ đa ngôn ngữ Vietnamese/English với next-intl v4.

**Coverage**:
- Tất cả admin pages/components
- Placeholders, labels, aria-labels
- Section type names
- Date locale (vi-VN)
- Validation messages (Zod + i18n)
- Field hints

**Files**:
- `src/messages/vi.json` — 150+ keys
- `src/messages/en.json` — 150+ keys (matching)

---

### 8. Public Landing Page (2026-08-22)

**Commits**: `84e1c94`, `737e0fd`

Trang landing page công khai cho người dùng cuối.

**Components**:
- `PublicNav` — Navigation bar với dark mode toggle
- `PublicFooter` — Footer component
- `AnimatedSection` — Scroll-triggered fade-in-up animations (Framer Motion)
- `CounterAnimation` — Animated number counters

**Render Flow**:
```
1. GET /pages/slug/:slug → lấy page data
2. Map sections → SectionComponent
3. Hero → render trực tiếp (có animation riêng)
4. Các section khác → wrap trong AnimatedSection
```

**Note**: Public page không dùng i18n — hardcoded Vietnamese.

---

### 9. Preview System (2026-08-22 → 2026-08-23)

**Commits**: `9fec45b`, `eee06e2`

Hệ thống preview cho pages và sections.

**Components**:
- `FullPagePreview` — Full-screen modal preview toàn bộ page
- `SectionPreviewModal` — Preview 1 section riêng lẻ
- `SectionPreview` — Renderer preview trong editor

**Features**:
- Full-screen modal overlay
- Open in new tab button
- Responsive preview
- Dark mode support

---

### 10. Dark Mode (2026-08-23)

**Commit**: `e9e0933`

Dark mode support trên tất cả admin components.

**Implementation**:
- Semantic color tokens: `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`
- Dark mode variants cho tất cả components
- Toggle button trong PublicNav
- CSS variables trong `globals.css`

---

### 11. Section Editor → Dedicated Pages (2026-08-23)

**Commits**: `324f225`, `eee06e2`

Section editor chuyển từ inline panel sang dedicated pages.

**Trước**: Section editor nằm trong edit page (inline panel)
**Sau**: Section editor là page riêng

**Lý do**:
- URL rõ ràng (`/pages/[id]/sections/[sectionId]/edit`)
- Dễ quản lý, dễ bookmark
- Breadcrumbs tự động
- Preview as modal

---

### 12. Drag & Drop (2026-08-27)

**Commits**: `d5a745e`, `d04adaf`

Kéo thả sắp xếp sections trong edit page.

**Library**: @atlaskit/pragmatic-drag-and-drop (thay thế @dnd-kit)

**Components**:
- `SectionList` — Danh sách sections với drag handles
- `SectionCard` — Card với drag handle + actions
- `DragOverlay` — Overlay khi đang kéo

**Flow**:
```
1. User kéo section card
2. DragOverlay hiển thị preview
3. Drop → reorder list
4. Call onReorder(sectionIds)
5. BE update order
```

---

### 13. React Hook Form + Zod (2026-08-25)

**Commit**: `7dc3e3f`

Form validation với React Hook Form và Zod.

**Implementation**:
- Tất cả forms dùng React Hook Form
- Zod schemas cho validation
- Validation messages dùng i18n (`t('validation.required', { field: 'Title' })`)
- `@hookform/resolvers` cho Zod integration

---

### 14. Playwright E2E Tests (2026-08-24)

**Commit**: `fa18f81`

End-to-end tests với Playwright.

**Coverage**:
- Login flow
- Dashboard
- Pages CRUD
- Section edit pages

---

## Thống kê

```
Routes:              8
Components:          30+
Hooks:               3 (usePages, useSections, useAuth)
Section Types:       5
i18n Keys:           150+ (vi + en)
UI Primitives:       12
E2E Tests:           Playwright
```

---

## Files chính

| File | Purpose |
|---|---|
| `src/app/[locale]/layout.tsx` | Locale layout (NextIntlClientProvider, AppLayout, Toaster) |
| `src/components/layout/AppLayout.tsx` | Sidebar + header + main content |
| `src/components/layout/Breadcrumbs.tsx` | Auto-generated breadcrumbs |
| `src/components/sections/section-constants.ts` | Section type registry |
| `src/components/sections/SectionList.tsx` | Sections list with DnD |
| `src/components/sections/editors/*.tsx` | Section editors (5 types) |
| `src/components/sections/*Section.tsx` | Section renderers (5 types) |
| `src/hooks/usePages.ts` | Pages CRUD hooks |
| `src/hooks/useSections.ts` | Sections CRUD hooks |
| `src/hooks/useAuth.ts` | Auth hooks |
| `src/lib/api.ts` | API client (fetchAPI wrapper) |
| `src/middleware.ts` | Locale redirect + auth guard |
| `src/messages/vi.json` | Vietnamese translations |
| `src/messages/en.json` | English translations |
