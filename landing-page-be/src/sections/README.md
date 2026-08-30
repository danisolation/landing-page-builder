# sections/ -- Sections Management Module

> CRUD for sections (content within each page).

---

## What does sections/ do?

```
POST   /pages/:pageId/sections              → Creates a new section in a page
GET    /pages/:pageId/sections              → Returns all sections of a page
GET    /pages/:pageId/sections/:id          → Returns details of a single section
PATCH  /pages/:pageId/sections/:id          → Updates a section
DELETE /pages/:pageId/sections/:id          → Deletes a section
```

---

## What is a Section?

Each landing page consists of multiple sections stacked on top of each other:

```
┌─────────────────────────┐
│      HERO SECTION       │  ← Section 1: Large heading, hero image
├─────────────────────────┤
│    FEATURES SECTION     │  ← Section 2: Product features
├─────────────────────────┤
│      CTA SECTION        │  ← Section 3: Call-to-action button
└─────────────────────────┘
```

Each section has:
- `type`: hero, features, cta, stats, testimonials
- `content`: JSON data (FE defines the shape)
- `order`: display order (1, 2, 3...)

---

## What are nested routes?

The route `/pages/:pageId/sections` is called a "nested route" — sections belong to a page:

```
/pages/abc123/sections        ← All sections of page abc123
/pages/abc123/sections/def456 ← Section def456 within page abc123
```

**Why use nesting?**
- Sections don't exist independently — they always belong to a page
- Clear routes: you know which page a section belongs to
- Easy management: delete a page → cascades to delete all its sections

---

## Content is JSON

Section content is a `Json` type in the database → the FE defines the shape:

```typescript
// Hero section content
{ "heading": "Welcome", "subheading": "Thank you for visiting...", "imageUrl": "..." }

// Features section content
{ "features": [
  { "title": "Fast", "description": "...", "icon": "zap" },
  { "title": "Secure", "description": "...", "icon": "shield" }
] }
```

**Why use JSON instead of separate columns?**
- Each section type has a different shape → no migration needed when adding new types
- The FE validates content according to its type
- The BE only stores and returns data — it doesn't need to understand the content

---

## Existence check

Before creating a section, the service checks whether the page exists:

```typescript
async create(pageId: string, dto: CreateSectionDto) {
  const page = await this.prisma.page.findUnique({ where: { id: pageId } });

  if (!page) {
    throw new NotFoundException(`Page with id "${pageId}" not found`);
  }

  return this.prisma.section.create({
    data: { ...dto, pageId },
  });
}
```

**Why is this check needed?**
- No check → create a section for a non-existent page → foreign key error (P2003)
- Check first → returns a clear 404
