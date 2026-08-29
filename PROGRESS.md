# Project Progress

> Auto-updated. any() session reads this to continue work.

## Current Status: All TODOs completed, code quality improved

Last updated: 2026-08-29

---

## ✅ Completed

### FE Codebase — CLAUDE.md Compliance (commit 6d0b547)
- [x] All 7 routes present and correct
- [x] File naming conventions (PascalCase, usePascalCase, kebab-case)
- [x] All 5 section types have renderer + editor + constants
- [x] SectionPreview + public page section maps complete
- [x] TanStack Query hooks (usePages, useSections, useAuth)
- [x] Mutations invalidate query keys on success
- [x] Auth flow (token in localStorage + cookie, middleware guard, logout clears both)
- [x] Breadcrumbs on all admin pages except /dashboard, /login
- [x] Section pages are separate (not inline), preview as modal, save redirects
- [x] Dark mode support on all admin components
- [x] Semantic color tokens (bg-background, bg-card, text-foreground, etc.)
- [x] Content width: max-w-7xl from AppLayout, no extra constraints
- [x] React Hook Form + Zod on all 5 forms
- [x] Zod validation messages use i18n
- [x] Loading states: loading.tsx on all routes, Skeleton components
- [x] Error boundaries: error.tsx on dashboard, pages, login
- [x] Mutation error handling with toast
- [x] next/image (no raw img tags)
- [x] Aria-labels on icon-only buttons
- [x] Dead code removed (base-ui toast)
- [x] i18n on ALL admin pages/components (placeholders, labels, aria, section types, date locale)
- [x] Clean code rules added to CLAUDE.md

### BE
- [x] NestJS + Prisma 7 + PostgreSQL setup
- [x] CRUD for pages and sections
- [x] Auth with JWT
- [x] Docker compose for local dev

---

## 📋 Known TODOs (not blocking)

All previous TODOs completed on 2026-08-29:

- [x] `: any` usage — reduced from 48 to 9 occurrences (81% reduction). Remaining 9 are intentional in `sectionComponents` maps and `getSectionSummary` where each component accepts a different content type.
- [x] Props typing — all editor components now use specific content types (HeroContent, FeaturesContent, etc.), dashboard components use `Page[]`, section types use `Section` and `SectionType`.
- [x] Dark mode — added `dark:bg-gray-900` + `dark:text-*-400` to CTA buttons in HeroSection.tsx and CtaSection.tsx.
- [x] Missing `error.tsx` — added to all 4 routes: `/pages/new`, `/pages/[id]/edit`, `/pages/[id]/sections/new`, `/pages/[id]/sections/[sectionId]/edit`.
- [x] Missing loading check — added `isLoading` + `SkeletonForm` to `/pages/[id]/sections/new/page.tsx`.
- [x] Performance — React.lazy for FullPagePreview and SectionPreviewModal in edit page, with Suspense fallback.
- [x] Focus trapping — added `role="dialog"`, `aria-modal="true"`, `tabIndex={-1}`, Escape key handler, and focus-on-open to SectionPreviewModal, FullPagePreview, and ConfirmDialog.
- [x] `useCallback` — wrapped SectionCard with `React.memo` to prevent unnecessary re-renders from inline callbacks.

---

## 🔧 Common Issues & Fixes

### Playwright tests fail with "test.describe() called in wrong place"
**Fix:** Run `npm install` in `landing-page-fe/` — version conflict between `playwright` and `@playwright/test`.

### Build fails after editing messages files
**Fix:** Check both `vi.json` and `en.json` have matching keys. Missing key = runtime error.

### Section editor placeholder still shows hardcoded text
**Check:** The placeholder must use `t('placeholderKey')`, not a string literal. Editor placeholders are in `heroEditor`, `ctaEditor`, `featuresEditor`, `statsEditor`, `testimonialsEditor` namespaces.

---

## 📁 Key Files Reference

| File | Purpose |
|------|---------|
| `landing-page-fe/CLAUDE.md` | FE rules — auto-loads when working in FE |
| `landing-page-be/CLAUDE.md` | BE rules — auto-loads when working in BE |
| `landing-page-fe/src/messages/vi.json` | Vietnamese translations |
| `landing-page-fe/src/messages/en.json` | English translations |
| `landing-page-fe/src/components/sections/section-constants.ts` | Section type registry (editors, defaults, types) |
| `landing-page-fe/src/hooks/` | TanStack Query hooks |
| `landing-page-fe/src/lib/api.ts` | API client (fetchAPI with auth) |
| `landing-page-fe/e2e/` | Playwright e2e tests |
