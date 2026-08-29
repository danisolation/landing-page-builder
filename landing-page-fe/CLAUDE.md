# Frontend Rules

Next.js 16 App Router + React 19 + TypeScript + Tailwind v4 + shadcn/ui base-nova + TanStack Query + next-intl + Framer Motion + Sonner

## Routing

All routes under `[locale]/` (vi/en). Root `/` redirects to `/vi`.

| Route | Purpose |
|---|---|
| `/{locale}/login` | Login |
| `/{locale}/dashboard` | Dashboard (stats overview only) |
| `/{locale}/pages` | Pages list (search, filter, sort, create) |
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
- Shown on ALL admin pages EXCEPT `/dashboard`, `/pages`, and `/login`
- Auto-generated from URL path — NOT a fixed pattern
- Starts with "Pages" for pages routes, "Dashboard" for others
- Filters out: `pages` segment, UUID segments
- Maps segments to labels: `sections` → "Sections", `new` → "Tạo mới", `edit` → "Chỉnh sửa"
- **NEVER create links to routes that don't exist** — if a segment's href doesn't match a real route, render as plain text (not a link)
- If a parent page has data (e.g. page title), pass it via `pageTitle` prop to show in breadcrumbs
- Extract repeated UI patterns into small components (e.g. `Chevron`)
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

## Component Size Rules

- Component tối đa **150 lines** — nếu dài hơn thì tách sub-components
- Component có **> 5-6 props** → nhóm thành config objects hoặc dùng composition
- Extract logic phức tạp (> 50 lines) vào custom hooks

## File Naming

- **Components**: `PascalCase.tsx` (e.g. `PageCard.tsx`, `SectionPreview.tsx`)
- **Hooks**: `usePascalCase.ts` (e.g. `usePages.ts`, `useAuth.ts`)
- **Utils**: `kebab-case.ts` (e.g. `api.ts`, `utils.ts`)
- **Constants**: `kebab-case.ts` (e.g. `section-constants.ts`)
- **Pages**: Next.js convention — `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`

## Props Interface Rules

- Dùng `interface` (không dùng `type` cho object shapes)
- KHÔNG prefix `I` (VD: `IButtonProps` → sai, `ButtonProps` → đúng)
- Props interface PHẢI export để reuse
- Default values dùng destructuring trong function signature
- Dùng `import type` cho type-only imports

```tsx
// ✅ Good
interface ButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'default' | 'lg'
  children: React.ReactNode
}

export function Button({ variant = 'default', size = 'default', children }: ButtonProps) { ... }

// ❌ Bad - prefix I, using type
interface IButtonProps { ... }
type ButtonProps = { ... }
```

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

### Mutation Rules (BẮT BUỘC)
useMutation PHẢI có:
- `onSuccess`: toast.success + invalidateQueries + redirect (nếu cần)
- `onError`: toast.error với message từ backend
- `onMutate` (optional): optimistic update cho instant UI feedback
- `onSettled` (optional): invalidateQueries (dùng khi muốn always refresh)

```typescript
// ✅ Complete mutation pattern
useMutation({
  mutationFn: createPage,
  onMutate: async (newPage) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['pages'] })
    // Snapshot previous value
    const previousPages = queryClient.getQueryData(['pages'])
    // Optimistic update
    queryClient.setQueryData(['pages'], (old) => [...old, newPage])
    return { previousPages }
  },
  onError: (err, newPage, context) => {
    // Rollback on error
    queryClient.setQueryData(['pages'], context.previousPages)
    toast.error(err.message || 'Đã xảy ra lỗi')
  },
  onSettled: () => {
    // Always refetch after error or success
    queryClient.invalidateQueries({ queryKey: ['pages'] })
  },
  onSuccess: () => {
    toast.success('Tạo trang thành công')
    router.push(`/${locale}/pages/${data.id}/edit`)
  },
})
```

// ❌ KHÔNG được bỏ trống onError

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

### Memoization Rules (Khi nào dùng)
- Dùng `React.memo` KHI: (1) re-render often, (2) same props, (3) expensive render
- Profile với React DevTools TRƯỚC KHI thêm memo
- Không thêm memo nếu không có measurable lag
- `memo` dùng shallow comparison — object/function mới mỗi render sẽ break nó
- Pair với `useCallback` cho functions, `useMemo` cho objects

```typescript
// ✅ Good - stable reference
const person = useMemo(() => ({ name, age }), [name, age])
const handleClick = useCallback(() => doSomething(id), [id])

// ❌ Bad - breaks memo
<Profile person={{ name, age }} onClick={() => doSomething(id)} />
```

### Code Splitting Rules
- `React.lazy()` PHẢI khai báo ở module top level — KHÔNG trong component
- Luôn wrap lazy component trong `<Suspense>` + Error Boundary
- Dynamic imports cho heavy components (charts, editors, modals)

```typescript
// ✅ Good - lazy at module level
const SectionPreviewModal = React.lazy(() => import('./SectionPreviewModal'))

// In component:
<Suspense fallback={<Skeleton />}>
  <SectionPreviewModal />
</Suspense>

// ❌ Bad - lazy inside component (causes state reset)
function MyComponent() {
  const Modal = React.lazy(() => import('./Modal')) // WRONG
}
```

### Image Optimization
```typescript
// ✅ next/image for images
import Image from 'next/image';
<Image src="/hero.jpg" alt="Hero" width={800} height={400} priority />
```

## Clean Code & Anti-Overengineering

- **Split by responsibility**: each file does ONE thing — page handles routing/layout, hooks handle data, components handle UI
- **Extract reusable logic**: if the same pattern appears 3+ times, extract to a hook or utility — but NOT before
- **Naming over comments**: good naming eliminates most comments; only comment WHY, not WHAT
- **Flat over deep**: prefer flat component trees over deep nesting; 3-4 levels max
- **Delete dead code**: if it's unused, remove it — don't keep "just in case"
- **No premature abstraction**: duplicate 2x is fine; abstract on the 3rd occurrence
- **No unnecessary wrappers**: don't create a component/hook for a single-use one-liner
- **Keep co-located**: if a utility is only used by one component, keep it in the same file
- **Prefer composition**: small composable components > one large component with many props
- **Simple state**: `useState` for local state, TanStack Query for server state — don't add state management libraries unless truly needed
- **No magic numbers/strings**: extract to named constants (e.g. `const PAGE_SIZE = 10`)
- **Consistent patterns**: if the codebase uses a pattern, follow it — don't introduce a new one for a single case

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

## Query Key Standards

- Dùng factory functions cho consistency
- Tất cả params ảnh hưởng kết quả PHẢI nằm trong key

```typescript
// ✅ Good - factory function
const pageKeys = {
  all: ['pages'] as const,
  detail: (id: string) => ['pages', { id }] as const,
  filtered: (filters: PageFilters) => ['pages', filters] as const,
}

// Usage
useQuery({ queryKey: pageKeys.all, queryFn: getPages })
useQuery({ queryKey: pageKeys.detail(id), queryFn: () => getPage(id) })
```

## UI Components

- Uses **shadcn/ui base-nova style** — headless primitives from `@base-ui/react`
- **Select** component uses `@radix-ui/react-select` (refactored from base-ui)
- **CVA** (class-variance-authority) for component variants
- **cn()** utility for merging Tailwind classes
- **Sonner** for toast notifications (NOT the base-ui toast in ui/toast.tsx)
- **Framer Motion** for scroll-triggered animations (`whileInView`, staggered children)
- **@atlaskit/pragmatic-drag-and-drop** for drag-and-drop section reordering (`@atlaskit/pragmatic-drag-and-drop/element/adapter`, `@atlaskit/pragmatic-drag-and-drop/reorder`)

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

## Testing Standards

### Query Priority (dùng theo thứ tự)
1. `getByRole` — accessible nhất, mirrors how users/AT find elements
2. `getByLabelText` — cho form elements
3. `getByText`
4. `getByTestId` — LAST RESORT only

### What to Test
- User-visible behavior: text content, element presence, attribute values
- Component output với specific props/inputs
- User interactions: click, type, submit → resulting UI changes
- Error states và loading states

### What NOT to Test
- Internal component state
- Implementation details (specific event sequences, internal methods)
- Third-party library behavior (React, TanStack Query internals)
- CSS styles (use visual regression testing tools instead)
- Snapshot tests cho large components (breaks on every change, rarely catches bugs)

```typescript
// ✅ Good - using screen and getByRole
screen.getByRole('button', { name: 'Submit' })
screen.queryByText('No results found') // for non-existence
await screen.findByText('Loaded') // for async

// ❌ Bad - container.querySelector
container.querySelector('button.submit')
```

## Mandatory Verification (CRITICAL)

When ANY admin UI change is made, you MUST:
1. `npm run build` — no type errors
2. `npx playwright test` — all pass
3. Visually verify layout matches dashboard (same width, same spacing)
4. Check breadcrumbs are correct for the route
5. Check dark mode works (toggle if possible)
6. Check responsive: mobile and desktop both look correct
7. If you changed a page's layout, add/update Playwright test for that page

## Related Page Updates (CRITICAL)

When modifying a page, ALWAYS check and update related pages:
- **Layout changes**: if you change a page's layout, check all sibling/child pages for consistency
- **Redirects**: if a page's redirect target changed, update all pages that redirect to it
- **Sidebar nav**: if you add/remove/rename a route, update sidebar nav items
- **Breadcrumbs**: if you change breadcrumb visibility rules, check all affected routes
- **i18n**: if you add keys for one page, check if related pages need the same keys
- **Components**: if a shared component changed behavior, verify all pages using it still work
- **Rule of thumb**: before finishing a task, list all files that reference the changed file/feature and check each one

## Git Rules

### Branch Naming
- `feature/<short-description>` — new features
- `fix/<short-description>` — bug fixes
- `chore/<short-description>` — maintenance, dependencies
- Use kebab-case: `feature/user-auth`, `fix/login-error`

### Commit Message (Conventional Commits)
```
<type>[optional scope]: <description>

feat(auth): add JWT refresh token flow
fix(api): prevent race condition in data fetching
docs: update README with quick start guide
```
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`
- Description: imperative mood, lowercase, no period, max 72 chars

### PR Standards
- Title follows Conventional Commits format
- PR description: what changed, why, how to test
- PR size: aim for <400 lines changed
- Squash merge vào main

## PR Checklist (tự check trước khi submit)

### Design
- [ ] Right approach chosen?
- [ ] Architecture sound?

### Functionality
- [ ] Code does what it claims?
- [ ] Error states handled?
- [ ] Redirect sau mutation thành công?

### Code Quality
- [ ] No `any` types
- [ ] Component < 150 lines
- [ ] Props interface defined + exported
- [ ] No unused imports/variables

### Testing
- [ ] Tests cover edge cases?
- [ ] `npm run build` pass
- [ ] `npm run lint` pass

### UI/UX
- [ ] Dark mode hoạt động
- [ ] Responsive mobile + desktop
- [ ] Loading states có skeleton
- [ ] Toast cho success/error

## Common Commands

```bash
npm run dev         # Dev server on port 3001
npm run build       # Production build (type-checks)
npm run lint        # ESLint
npx playwright test # E2E tests
```

## Anti-Patterns to Avoid

| Anti-Pattern | Correct Approach |
|---|---|
| `<div onClick>` for buttons | Use `<button>` |
| Index as list key | Use stable, unique ID |
| Storing server data in useState | Use TanStack Query `useQuery` |
| `memo` without measuring perf | Profile first with React DevTools |
| `any` type | Use `unknown` and narrow |
| `useEffect` for derived state | Compute during render or `useMemo` |
| `console.log` in production | Use structured logging |
| Snapshot tests for large components | Test behavior, not structure |
| Inline `style={{}}` for static styles | Use Tailwind classes |
| `require()` in TypeScript | Use ES6 `import` syntax |
| `== null` (unintentional) | `=== null \|\| === undefined` (intentional) |
| `new Array()` / `new Object()` | Use literal syntax `[]` / `{}` |
| Mutation in reducer | Always return new objects with spread |
