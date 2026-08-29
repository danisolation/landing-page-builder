# prisma/ — Database layer

> 📖 Kết nối backend với PostgreSQL database.

---

## prisma/ làm gì?

```
prisma/
├── prisma.module.ts    ← Đăng PrismaService là global module
└── prisma.service.ts   ← Kết nối database, cung cấp PrismaClient
```

---

## Prisma là gì?

Prisma = ORM (Object-Relational Mapping) — chuyển code TypeScript thành SQL:

```typescript
// Code bạn viết:
await prisma.page.findUnique({ where: { id: "abc123" } });

// SQL Prisma tạo:
SELECT * FROM "Page" WHERE id = 'abc123';
```

**Tại sao dùng Prisma thay vì viết SQL trực tiếp?**
- Type-safe: TypeScript kiểm tra lỗi khi compile
- Auto-generate: từ schema.prisma → tạo TypeScript types
- Migration: thay đổi schema → Prisma tạo migration SQL
- An toàn: Prisma tự escape parameters → chống SQL injection

---

## PrismaService

```typescript
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();  // Kết nối DB khi app khởi tạo
  }
}
```

**Cách dùng trong service:**
```typescript
export class PagesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.page.findMany();  // SELECT * FROM "Page"
  }
}
```

---

## Schema (ở prisma/schema.prisma)

```prisma
model Page {
  id          String   @id @default(uuid())
  title       String
  slug        String   @unique
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  sections    Section[]  // ← Relation: 1 page có nhiều sections
}

model Section {
  id        String   @id @default(uuid())
  type      String   // hero, features, cta, stats, testimonials
  content   Json     // ← Flexible: FE tự định nghĩa shape
  order     Int
  pageId    String
  page      Page     @relation(fields: [pageId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Lưu ý:**
- `@id @default(uuid())` — Primary key, tự generate UUID
- `@unique` — Slug phải unique
- `@relation(onDelete: Cascade)` — Xóa page → tự động xóa sections
- `Json` type — Content là JSON, không cần schema migration khi đổi shape

---

## Migration

Khi thay đổi schema.prisma:
```bash
npx prisma migrate dev --name add-new-field
```

Prisma sẽ:
1. So sánh schema mới vs database hiện tại
2. Tạo file SQL migration
3. Chạy migration
4. Regenerate PrismaClient types

---

## Prisma Studio

Tool GUI để xem/sửa database:
```bash
npx prisma studio
# Mở http://localhost:5555
```
