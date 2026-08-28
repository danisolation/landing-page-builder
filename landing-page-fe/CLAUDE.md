# Frontend Rules

Next.js 16 App Router + React 19 + TypeScript + Tailwind v4 + shadcn/ui base-nova + TanStack Query + next-intl + Framer Motion + Sonner

## Routing

All routes under `[locale]/` (vi/en). Root `/` redirects to `/vi`.

| Route | Purpose |
|---|---|
| `/{locale}/login` | Login |
| `/{locale}/dashboard` | Dashboard |
| `/{locale}/pages/new` | Create page |
| `/{locale}/pages/{id}/edit` | Edit page + sections list |
| `/{locale}/pages/{id}/sections/new` | Add section |
| `/{locale}/pages/{id}/sections/{sectionId}/edit` | Edit section |
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

### Content Width (CRITICAL)
- ALL admin pages inherit `max-w-7xl mx-auto` from AppLayout `<main>`
- NEVER add additional `max-w-*` constraints inside page content — this breaks layout consistency
- The ONLY exception: form fields inside cards (which naturally size to their container)
- Dashboard, pages/new, pages/edit, sections/new, sections/[sectionId]/edit — ALL must have the same outer width
- Rule: if you're about to add `max-w-*` to a page `<div>`, STOP — it's wrong

### Breadcrumbs
- Shown on ALL admin pages EXCEPT `/dashboard` and `/login`
- Auto-generated from URL path — NOT a fixed pattern
- Always starts with "Dashboard" link
- Filters out: `pages` segment, UUID segments
- Maps segments to labels: `sections` → "Sections", `new` → "Tạo mới", `edit` → "Chỉnh sửa"
- Uses semantic token colors: `text-muted-foreground`, `hover:text-foreground`, `hover:bg-accent`

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

## Conventions

- **Client components by default** — pages and interactive components use `"use client"`
- **Server components** — only for layouts and root redirect
- **Path alias** — `@/*` maps to `./src/*`
- **Custom hooks** — `usePages()`, `useSections(pageId)`, `useAuth()` wrap TanStack Query
- **Mutations** invalidate corresponding query key on success
- **Props typing** — always define interfaces for component props, avoid `any` where practical
- **Vietnamese-first** — default locale `vi`, date format `vi-VN`
- **Forms** — use React Hook Form + Zod for validation (`react-hook-form`, `@hookform/resolvers`, `zod`)

## File Naming

- **Components**: `PascalCase.tsx` (e.g. `PageCard.tsx`, `SectionPreview.tsx`)
- **Hooks**: `usePascalCase.ts` (e.g. `usePages.ts`, `useAuth.ts`)
- **Utils**: `kebab-case.ts` (e.g. `api.ts`, `utils.ts`)
- **Constants**: `kebab-case.ts` (e.g. `section-constants.ts`)
- **Pages**: Next.js convention — `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`

## Import Order

Organize imports in this order (separated by blank lines):
```typescript
// 1. React & Next.js
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party libs
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

// 3. Components (shadcn/ui first, then custom)
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import PageCard from '@/components/dashboard/PageCard';

// 4. Hooks
import { usePages } from '@/hooks/usePages';

// 5. Lib & Utils
import { getPages } from '@/lib/api';
import { cn } from '@/lib/utils';

// 6. Types
import type { Page } from '@/types';
```

## Error Handling

### Error Boundaries
- Use Next.js `error.tsx` file for route-level error boundaries
- Use React `ErrorBoundary` component for component-level errors
- Always show user-friendly error messages, not raw errors

### Error States in Data Fetching
```typescript
// ✅ Handle loading, error, and success states
const { data, isLoading, error } = useQuery({...});

if (isLoading) return <Skeleton />;
if (error) return <ErrorMessage message={error.message} />;
if (!data) return <EmptyState />;
```

### Mutation Error Handling
```typescript
// ✅ Always handle mutation errors
useMutation({
  mutationFn: createPage,
  onSuccess: () => toast.success('Created!'),
  onError: (error) => toast.error(error.message || 'Failed'),
});
```

## Loading States

- **Lists**: use `Skeleton` components (match final layout shape)
- **Forms**: disable submit button + show loading text
- **Pages**: use `loading.tsx` file for route-level loading
- **Actions**: use `isPending` from mutations to disable buttons
- **Optimistic updates**: use for instant UI feedback on mutations

```typescript
// ✅ Skeleton for lists
if (isLoading) return <SkeletonList count={3} />;

// ✅ Pending state for buttons
<Button disabled={isPending}>
  {isPending ? 'Đang lưu...' : 'Lưu'}
</Button>
```

## Responsive Design

- **Mobile-first**: write base styles for mobile, add `sm:`, `md:`, `lg:` for larger screens
- **Breakpoints**: `sm:640px md:768px lg:1024px xl:1280px`
- **Layout**: use flexbox/grid with responsive utilities
- **Touch targets**: minimum 44px for interactive elements on mobile

```typescript
// ✅ Mobile-first responsive
<div className="flex flex-col sm:flex-row gap-4">
  <div className="w-full sm:w-1/2">...</div>
  <div className="w-full sm:w-1/2">...</div>
</div>
```

## Accessibility (a11y)

- **Semantic HTML**: use `<nav>`, `<main>`, `<section>`, `<article>`, `<button>` (not `<div onClick>`)
- **ARIA labels**: add `aria-label` to icon-only buttons
- **Keyboard navigation**: all interactive elements must be focusable and operable with keyboard
- **Focus management**: trap focus in modals, restore focus on close
- **Color contrast**: ensure text meets WCAG AA contrast ratio (4.5:1 for normal text)
- **Screen readers**: use `sr-only` class for visually hidden but accessible text

```typescript
// ✅ Accessible button with icon
<Button aria-label="Delete page">
  <TrashIcon className="w-4 h-4" />
</Button>

// ✅ Accessible modal
<Dialog aria-labelledby="dialog-title" aria-describedby="dialog-description">
  <h2 id="dialog-title">Confirm</h2>
  <p id="dialog-description">Are you sure?</p>
</Dialog>
```

## Performance

- **Lazy loading**: use `React.lazy()` for heavy components not needed on initial render
- **Image optimization**: use `next/image` for all images (auto WebP, lazy loading, responsive)
- **Code splitting**: Next.js auto-splits by route; avoid large bundle imports
- **Memoization**: use `useMemo` for expensive computations, `useCallback` for passed callbacks
- **Avoid re-renders**: don't create objects/arrays in render; extract to constants or useMemo

```typescript
// ✅ Lazy load heavy component
const SectionPreviewModal = React.lazy(() => import('./SectionPreviewModal'));

// ✅ Memoize expensive computation
const filteredPages = useMemo(() => {
  return pages.filter(p => p.title.includes(search));
}, [pages, search]);

// ✅ next/image for images
import Image from 'next/image';
<Image src="/hero.jpg" alt="Hero" width={800} height={400} priority />
```

## Security

- **XSS prevention**: never use `dangerouslySetInnerHTML` with user input
- **Input sanitization**: sanitize user-generated content before rendering
- **API validation**: validate all API responses on the client (don't trust server data blindly)
- **Sensitive data**: never store secrets in client-side code or localStorage
- **HTTPS**: always use HTTPS in production

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
- **Framer Motion** for scroll-triggered animations (`whileInView`, staggered children)
- **@dnd-kit** for drag-and-drop section reordering (`@dnd-kit/core`, `@dnd-kit/sortable`)

## Public Page Components

- `PublicNav` — navigation bar with dark mode toggle
- `PublicFooter` — footer component
- `AnimatedSection` — wrapper for scroll-triggered fade-in-up animations
- `CounterAnimation` — animated number counters
- Public page does NOT use i18n — hardcoded Vietnamese

## Section Types

Currently supported: `hero`, `features`, `cta`, `stats`, `testimonials`

Each type has: renderer (`XxxSection.tsx`), editor (`editors/XxxEditor.tsx`), entry in `section-constants.ts`

## Adding a New Section Type

1. Create renderer: `components/sections/XxxSection.tsx`
2. Create editor: `components/sections/editors/XxxEditor.tsx`
3. Add to `components/sections/section-constants.ts`: import editor, add to `sectionEditors` map, add to `defaultContent`, add to `sectionTypes` array
4. Add to `SectionPreview.tsx`: import, add to `sectionComponents` map
5. Add to public page `[slug]/page.tsx`: import, add to `sectionComponents` map
6. Add i18n keys to `messages/vi.json` and `messages/en.json`
7. **No BE changes needed** — content is JSON, FE defines the shape

## Auth Flow

1. Login → POST `/auth/login` → `access_token`
2. Token in `localStorage` + cookie (for middleware)
3. Middleware guards protected routes (redirect to login if no token)
4. `fetchAPI()` attaches `Authorization: Bearer <token>` to all requests
5. Logout → clear localStorage + cookie → redirect
6. **No refresh token** — expired = login again

## i18n

- Library: `next-intl` v4. Locales: `vi` (default), `en`
- Usage: `const t = useTranslations('namespace')` then `t('key')`
- Messages in `src/messages/vi.json` and `src/messages/en.json`
- **Public page does NOT use i18n** — hardcoded Vietnamese

## Mandatory Verification (CRITICAL)

When ANY admin UI change is made, you MUST:
1. `npm run build` — no type errors
2. `npx playwright test` — all pass
3. Visually verify layout matches dashboard (same width, same spacing)
4. Check breadcrumbs are correct for the route
5. Check dark mode works (toggle if possible)
6. Check responsive: mobile and desktop both look correct
7. If you changed a page's layout, add/update Playwright test for that page

## Common Commands

```bash
npm run dev         # Dev server on port 3001
npm run build       # Production build (type-checks)
npm run lint        # ESLint
npx playwright test # E2E tests
```
