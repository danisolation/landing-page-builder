# prisma/ -- Database Layer

> Connects the backend to the PostgreSQL database.

---

## What does prisma/ do?

```
prisma/
├── prisma.module.ts    ← Registers PrismaService as a global module
└── prisma.service.ts   ← Connects to the database, provides PrismaClient
```

---

## What is Prisma?

Prisma = ORM (Object-Relational Mapping) — translates TypeScript code into SQL:

```typescript
// Code you write:
await prisma.page.findUnique({ where: { id: "abc123" } });

// SQL Prisma generates:
SELECT * FROM "Page" WHERE id = 'abc123';
```

**Why use Prisma instead of writing SQL directly?**
- Type-safe: TypeScript catches errors at compile time
- Auto-generated: from schema.prisma → creates TypeScript types
- Migrations: change the schema → Prisma generates migration SQL
- Secure: Prisma automatically escapes parameters → prevents SQL injection

---

## PrismaService

```typescript
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();  // Connects to DB when the app starts
  }
}
```

**Usage in a service:**
```typescript
export class PagesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.page.findMany();  // SELECT * FROM "Page"
  }
}
```

---

## Schema (in prisma/schema.prisma)

```prisma
model Page {
  id          String   @id @default(uuid())
  title       String
  slug        String   @unique
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  sections    Section[]  // ← Relation: 1 page has many sections
}

model Section {
  id        String   @id @default(uuid())
  type      String   // hero, features, cta, stats, testimonials
  content   Json     // ← Flexible: FE defines the shape
  order     Int
  pageId    String
  page      Page     @relation(fields: [pageId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Notes:**
- `@id @default(uuid())` — Primary key, auto-generates UUID
- `@unique` — Slug must be unique
- `@relation(onDelete: Cascade)` — Deleting a page automatically deletes its sections
- `Json` type — Content is JSON, no schema migration needed when changing the shape

---

## Migration

When you change schema.prisma:
```bash
npx prisma migrate dev --name add-new-field
```

Prisma will:
1. Compare the new schema against the current database
2. Generate a SQL migration file
3. Run the migration
4. Regenerate PrismaClient types

---

## Prisma Studio

A GUI tool for viewing and editing the database:
```bash
npx prisma studio
# Opens http://localhost:5555
```
