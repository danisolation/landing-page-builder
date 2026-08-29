# pages/ — Module quản lý trang

> 📖 CRUD (Create, Read, Update, Delete) cho landing pages.

---

## pages/ làm gì?

```
POST   /pages          → Tạo trang mới
GET    /pages          → Lấy danh sách tất cả trang
GET    /pages/:id      → Lấy chi tiết 1 trang
GET    /pages/slug/:slug → Lấy trang theo slug (cho FE public)
PATCH  /pages/:id      → Cập nhật trang
DELETE /pages/:id      → Xóa trang (cascade xóa luôn sections)
```

---

## CRUD là gì?

CRUD = 4 thao tác cơ bản với database:

| Operation | HTTP Method | SQL | Ví dụ |
|-----------|------------|-----|-------|
| **C**reate | POST | INSERT | Tạo trang mới |
| **R**ead | GET | SELECT | Lấy danh sách trang |
| **U**pdate | PATCH | UPDATE | Sửa tiêu đề trang |
| **D**elete | DELETE | DELETE | Xóa trang |

---

## Cấu trúc module

```
pages/
├── pages.module.ts        ← Đăng controller + service vào NestJS
├── pages.controller.ts    ← Route handlers (nhận request, gọi service)
├── pages.service.ts       ← Business logic (query database)
└── dto/
    ├── create-page.dto.ts ← Validate khi tạo: title (bắt buộc), slug (bắt buộc, unique)
    └── update-page.dto.ts ← Validate khi sửa: tất cả optional (PartialType)
```

---

## Controller vs Service — Phân biệt

**Controller** (nhận request):
```typescript
@Post()
async create(@Body() dto: CreatePageDto) {
  return this.pagesService.create(dto);  // ← Gọi service, KHÔNG query DB ở đây
}
```

**Service** (xử lý logic):
```typescript
async create(dto: CreatePageDto) {
  this.logger.log(`Creating page: ${dto.title}`);
  return this.prisma.page.create({
    data: dto,  // ← Query database ở đây
  });
}
```

**Quy tắc:** Controller chỉ nhận request và gọi service. Service xử lý tất cả logic.

---

## DTO là gì?

DTO (Data Transfer Object) = "hình dạng" của data client gửi lên.

```typescript
export class CreatePageDto {
  @IsString()           // Phải là string
  @IsNotEmpty()         // Không được rỗng
  @MaxLength(255)       // Tối đa 255 ký tự
  title!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)  // Chỉ chữ thường, số, dấu gạch ngang
  slug!: string;
}
```

**Tại sao cần DTO?**
- Client gửi `{ title: "", slug: "../../etc/passwd" }` → DTO reject ngay
- Không có DTO → Prisma query với data bẩn → lỗi hoặc security issue

---

## Prisma query examples

```typescript
// Tạo page
await prisma.page.create({ data: { title: "Test", slug: "test" } });

// Lấy tất cả pages (kèm sections)
await prisma.page.findMany({
  include: { sections: { orderBy: { order: 'asc' } } }
});

// Tìm theo ID
await prisma.page.findUnique({ where: { id: "uuid-here" } });

// Cập nhật
await prisma.page.update({
  where: { id: "uuid-here" },
  data: { title: "New Title" }
});

// Xóa (cascade xóa luôn sections do schema.prisma définir)
await prisma.page.delete({ where: { id: "uuid-here" } });
```
