# Frontend Rules — Landing Page Builder

## Tech Stack

- Next.js 16.3.2 App Router + React 19
- TypeScript, Tailwind CSS v4
- shadcn/ui base-nova style (`@base-ui/react` primitives, NOT Radix — except Select)
- TanStack React Query for data fetching
- next-intl for i18n (vi/en, default: vi)
- Framer Motion for animations
- Sonner for toast notifications
- Lucide React for icons

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout (font, QueryProvider)
│   ├── page.tsx                # Redirect / → /vi
│   └── [locale]/
│       ├── layout.tsx          # Locale layout (NextIntlClientProvider, AppLayout, Toaster)
│       ├── login/              # Login page
│       ├── dashboard/          # Dashboard — page list
│       ├── pages/
│       │   ├── new/            # Create page
│       │   └── [id]/
│       │       ├── edit/       # Edit page info + sections list
│       │       └── sections/
│       │           ├── new/    # Add new section (editor + preview modal)
│       │           └── [sectionId]/edit/  # Edit section (editor + preview modal)
│       └── [slug]/             # Public landing page render
├── components/
│   ├── layout/                 # AppLayout, Breadcrumbs, LanguageSwitcher
│   ├── dashboard/              # StatsCards, SearchFilter, PageCard
│   ├── sections/               # Section renderers, constants, preview
│   │   ├── editors/            # Section editor forms (HeroEditor, etc.)
│   │   └── section-constants.ts  # Shared editors map, defaultContent, sectionTypes
│   ├── public/                 # Public page components (Nav, Footer, AnimatedSection)
│   └── ui/                     # shadcn/ui primitives
├── hooks/                      # Custom hooks (useAuth, usePages, useSections)
├── i18n/                       # next-intl config
├── lib/
│   ├── api.ts                  # Centralized fetch wrapper + API functions
│   └── utils.ts                # cn() helper
├── messages/                   # i18n translations (vi.json, en.json)
└── providers/                  # QueryProvider
```

## Routing

All routes are under `[locale]/` (vi or en). Root `/` redirects to `/vi`.

| Route | Purpose |
|---|---|
| `/{locale}/login` | Login |
| `/{locale}/dashboard` | Dashboard |
| `/{locale}/pages/new` | Create page |
| `/{locale}/pages/{id}/edit` | Edit page + sections list |
| `/{locale}/pages/{id}/sections/new` | Add new section |
| `/{locale}/pages/{id}/sections/{sectionId}/edit` | Edit existing section |
| `/{locale}/{slug}` | Public landing page |

## Layout Rules

### Background Colors
- **ALL admin pages**: use `bg-background` CSS variable (NOT hardcoded `bg-white`, `bg-gray-*`, or `bg-[oklch(...)]`)
- **Cards/Surfaces**: use `bg-card` semantic token
- **Subtle surfaces** (header/footer panels): use `bg-muted` or `bg-accent`
- **Borders**: use `border-border` (defined in globals.css base layer)

### Text Colors
- Primary text: `text-foreground` (NOT `text-gray-900`)
- Secondary/muted text: `text-muted-foreground` (NOT `text-gray-500`, `text-gray-400`)
- Hover states: `hover:text-foreground` with `hover:bg-accent`

### Dark Mode
- Every admin component MUST have dark mode support
- Use Tailwind `dark:` variants OR semantic tokens (which auto-adapt)
- Tint backgrounds: `bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400`
- NEVER use `bg-white` without a `dark:` counterpart

### Page Structure (Admin)
Every admin page follows this pattern:
```
<div>
  <Breadcrumbs />
  <div className="flex justify-between items-center mb-6">
    <h1 className="text-2xl font-bold text-foreground tracking-tight">Title</h1>
    <div className="flex gap-2">Actions</div>
  </div>
  Content
</div>
```

### Content Width (CRITICAL)
- ALL admin pages inherit `max-w-7xl mx-auto` from AppLayout `<main>`
- NEVER add additional `max-w-*` constraints inside page content — this breaks layout consistency
- The ONLY exception: form fields inside cards (which naturally size to their container)
- Dashboard, pages/new, pages/edit, sections/new, sections/[sectionId]/edit — ALL must have the same outer width
- Rule: if you're about to add `max-w-*` to a page `<div>`, STOP — it's wrong

### Mandatory Verification (CRITICAL)
When ANY admin UI change is made, you MUST:
1. Run `npm run build` — no type errors
2. Run Playwright tests — `npx playwright test`
3. Visually verify layout matches dashboard (same width, same spacing)
4. Check breadcrumbs are correct for the route
5. Check dark mode works (toggle if possible)
6. Check responsive: mobile and desktop both look correct
7. If you changed a page's layout, add/update Playwright test for that page

### Breadcrumbs
- Shown on ALL admin pages EXCEPT `/dashboard` and `/login`
- Pattern: `Dashboard > Section > Action`
- Uses semantic token colors: `text-muted-foreground`, `hover:text-foreground`, `hover:bg-accent`
- Path segments: `pages` is filtered out (not shown), UUIDs are filtered out
- Available labels: `dashboard`, `sections`, `new` (createNew), `edit` (editPage)

### Section Pages
- Section create/edit are SEPARATE pages (not inline panels)
- Section edit: `/pages/[id]/sections/[sectionId]/edit`
- Section new: `/pages/[id]/sections/new`
- Preview: opens as `SectionPreviewModal` (full-screen modal), NOT inline
- Layout: single-column form (`max-w-3xl`), with preview as modal button in header
- Save → redirect back to `/pages/[id]/edit`

### Component Tokens (shadcn/ui)
- Card: `bg-card`, `text-card-foreground`, `ring-foreground/10`
- Button: uses CVA variants (`default`, `outline`, `ghost`, `destructive`)
- Input/Select: inherit from CSS variables (`--input`, `--border`)
- ConfirmDialog overlay: `bg-black/60`
- Preview modals: `bg-background` panel, `bg-card` header

## Component Conventions

- **Client components by default** — pages and interactive components use `"use client"`
- **Server components** — only for layouts and root redirect
- **Path alias** — `@/*` maps to `./src/*`
- **Props typing** — always define interfaces for component props, avoid `any` where practical

## Data Fetching Pattern

```typescript
// ✅ Custom hook wrapping TanStack Query
export function usePages() {
  return useQuery({ queryKey: ['pages'], queryFn: getPages });
}

// ✅ Mutation with invalidation
export function useCreatePage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPage,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pages'] }),
  });
}

// ❌ Don't call api.ts functions directly in components (except public page)
```

## UI Components

- Uses **shadcn/ui base-nova style** — headless primitives from `@base-ui/react`
- **Select** component uses `@radix-ui/react-select` (refactored from base-ui)
- **CVA** (class-variance-authority) for component variants
- **cn()** utility for merging Tailwind classes
- **Sonner** for toast notifications (NOT the base-ui toast in ui/toast.tsx)

## Adding a New Section Type

1. Create renderer: `components/sections/XxxSection.tsx`
2. Create editor: `components/sections/editors/XxxEditor.tsx`
3. Add to `components/sections/section-constants.ts`: import editor, add to `sectionEditors` map, add to `defaultContent`, add to `sectionTypes` array
4. Add to `SectionPreview.tsx`: import, add to `sectionComponents` map
5. Add to public page `[slug]/page.tsx`: import, add to `sectionComponents` map
6. Add i18n keys to `messages/vi.json` and `messages/en.json`
7. **No BE changes needed** — content is JSON, FE defines the shape

## i18n

- Library: `next-intl` v4
- Locales: `vi` (default), `en`
- Usage: `const t = useTranslations('namespace')` then `t('key')`
- Messages in `src/messages/vi.json` and `src/messages/en.json`
- **Public page does NOT use i18n** — hardcoded Vietnamese

## Dark Mode

- CSS class `dark` on `<html>` element
- Toggle in PublicNav, preference in localStorage
- Every section component has `dark:` variants
- CSS variables defined in `globals.css` for light/dark

## Animations

- **Framer Motion** for scroll-triggered animations (`whileInView`)
- **Staggered children** via `variants` + `staggerChildren`
- **CSS keyframes** in `globals.css` for floating decorative elements
- **AnimatedSection** wrapper for consistent fade-in-up on scroll

## Auth Flow

1. Login → POST `/auth/login` → `access_token`
2. Token in `localStorage` + cookie (for middleware)
3. Middleware guards protected routes (redirect to login if no token)
4. `fetchAPI()` attaches `Authorization: Bearer <token>` to all requests
5. Logout → clear localStorage + cookie → redirect

## API Layer

- All API functions in `src/lib/api.ts`
- Base URL: `http://localhost:3000` (hardcoded)
- `fetchAPI()` wrapper handles auth headers and error throwing

## Common Commands

```bash
npm run dev         # Dev server on port 3001
npm run build       # Production build (type-checks)
npm run lint        # ESLint
```
