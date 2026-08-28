# Project Progress

> Auto-updated. any() session reads this to continue work.

## Current Status: FE audit complete, ready for feature work

Last updated: 2026-08-28

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

- [ ] `: any` usage — 51 occurrences across 22 files. CLAUDE.md says "avoid any where practical". Priority: medium. Not blocking feature work.
- [ ] Props typing — many component interfaces use `any` for props. Same as above.
- [ ] Dark mode — `bg-white` without `dark:` counterpart in HeroSection.tsx (line 65) and CtaSection.tsx (line 60). Medium priority.
- [ ] Missing `error.tsx` on 4 routes: `/pages/new`, `/pages/[id]/edit`, `/pages/[id]/sections/new`, `/pages/[id]/sections/[sectionId]/edit`. Medium priority.
- [ ] Missing loading check for `usePage()` in `/pages/[id]/sections/new/page.tsx`. Medium priority.
- [ ] Performance — React.lazy for heavy modals (FullPagePreview, SectionPreviewModal). Low priority.
- [ ] Focus trapping in modals (SectionPreviewModal, FullPagePreview, ConfirmDialog). Low priority.
- [ ] `useCallback` for passed callbacks in SectionList (handleDragEnd, handleDragStart). Low priority.

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
