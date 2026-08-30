# pages/ -- Pages Management Module

> CRUD (Create, Read, Update, Delete) for landing pages.

---

## What does pages/ do?

```
POST   /pages          → Creates a new page
GET    /pages          → Returns a list of all pages
GET    /pages/:id      → Returns details of a single page
GET    /pages/slug/:slug → Returns a page by slug (for public FE)
PATCH  /pages/:id      → Updates a page
DELETE /pages/:id      → Deletes a page (cascades to delete sections)
```

---

## What is CRUD?

CRUD = 4 basic database operations:

| Operation | HTTP Method | SQL | Example |
|-----------|------------|-----|---------|
| **C**reate | POST | INSERT | Create a new page |
| **R**ead | GET | SELECT | Fetch a list of pages |
| **U**pdate | PATCH | UPDATE | Edit a page title |
| **D**elete | DELETE | DELETE | Delete a page |

---

## Module structure

```
pages/
├── pages.module.ts        ← Registers controller + service with NestJS
├── pages.controller.ts    ← Route handlers (receive request, call service)
├── pages.service.ts       ← Business logic (query database)
└── dto/
    ├── create-page.dto.ts ← Validates on create: title (required), slug (required, unique)
    └── update-page.dto.ts ← Validates on update: all optional (PartialType)
```

---

## Controller vs Service -- The difference

**Controller** (receives requests):
```typescript
@Post()
async create(@Body() dto: CreatePageDto) {
  return this.pagesService.create(dto);  // ← Calls the service, does NOT query DB here
}
```

**Service** (handles logic):
```typescript
async create(dto: CreatePageDto) {
  this.logger.log(`Creating page: ${dto.title}`);
  return this.prisma.page.create({
    data: dto,  // ← Queries the database here
  });
}
```

**Rule:** The controller only receives requests and calls the service. The service handles all logic.

---

## What is a DTO?

DTO (Data Transfer Object) = the "shape" of the data the client sends.

```typescript
export class CreatePageDto {
  @IsString()           // Must be a string
  @IsNotEmpty()         // Cannot be empty
  @MaxLength(255)       // Maximum 255 characters
  title!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)  // Only lowercase, numbers, hyphens
  slug!: string;
}
```

**Why do we need DTOs?**
- Client sends `{ title: "", slug: "../../etc/passwd" }` → DTO rejects it immediately
- Without DTOs → Prisma queries with dirty data → errors or security issues

---

## Prisma query examples

```typescript
// Create a page
await prisma.page.create({ data: { title: "Test", slug: "test" } });

// Fetch all pages (including sections)
await prisma.page.findMany({
  include: { sections: { orderBy: { order: 'asc' } } }
});

// Find by ID
await prisma.page.findUnique({ where: { id: "uuid-here" } });

// Update
await prisma.page.update({
  where: { id: "uuid-here" },
  data: { title: "New Title" }
});

// Delete (cascades to delete sections as defined in schema.prisma)
await prisma.page.delete({ where: { id: "uuid-here" } });
```
