# sections/ — Module quản lý section

> 📖 CRUD cho sections (nội dung trong mỗi trang).

---

## sections/ làm gì?

```
POST   /pages/:pageId/sections              → Tạo section mới trong page
GET    /pages/:pageId/sections              → Lấy tất cả sections của page
GET    /pages/:pageId/sections/:id          → Lấy chi tiết 1 section
PATCH  /pages/:pageId/sections/:id          → Cập nhật section
DELETE /pages/:pageId/sections/:id          → Xóa section
```

---

## Section là gì?

Mỗi landing page có nhiều sections xếp chồng lên nhau:

```
┌─────────────────────────┐
│      HERO SECTION       │  ← Section 1: Tiêu đề lớn, hình ảnh
├─────────────────────────┤
│    FEATURES SECTION     │  ← Section 2: Tính năng sản phẩm
├─────────────────────────┤
│      CTA SECTION        │  ← Section 3: Nút kêu gọi hành động
└─────────────────────────┘
```

Mỗi section có:
- `type`: hero, features, cta, stats, testimonials
- `content`: JSON data (FE định nghĩa shape)
- `order`: thứ tự hiển thị (1, 2, 3...)

---

## Nested routes là gì?

Route `/pages/:pageId/sections` gọi là "nested route" — section nằm trong page:

```
/pages/abc123/sections        ← Tất cả sections của page abc123
/pages/abc123/sections/def456 ← Section def456 trong page abc123
```

**Tại sao cần nested?**
- Section không tồn tại độc lập — nó luôn thuộc về page
- Route rõ ràng: biết section thuộc page nào
- Dễ quản lý: xóa page → cascade xóa tất cả sections

---

## Content là JSON

Section content là `Json` type trong database → FE tự định nghĩa shape:

```typescript
// Hero section content
{ "heading": "Xin chào", "subheading": "Chào mừng đến...", "imageUrl": "..." }

// Features section content
{ "features": [
  { "title": "Nhanh", "description": "...", "icon": "zap" },
  { "title": "An toàn", "description": "...", "icon": "shield" }
] }
```

**Tại sao dùng JSON thay vì columns riêng?**
- Mỗi section type có shape khác nhau → không cần migration khi thêm type mới
- FE tự validate content theo type
- BE chỉ lưu và trả về, không cần hiểu content

---

## Existence check

Trước khi tạo section, service kiểm tra page có tồn tại không:

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

**Tại sao cần check?**
- Không check → tạo section cho page không tồn tại → foreign key error (P2003)
- Check trước → trả 404 rõ ràng
