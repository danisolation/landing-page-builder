# SEO Meta Fields — Backend Implementation Guide

## Tổng quan

Thêm 3 trường SEO optional vào model `Page`:
- `metaTitle` — override `<title>` tag (max 255 chars)
- `metaDescription` — `<meta name="description">` (max 500 chars)
- `ogImageUrl` — `<meta property="og:image">` URL (max 2048 chars)

Tất cả optional — nếu trống, FE sẽ fallback về `title` và `description` hiện có.

---

## Bước 1: Prisma Schema

**File:** `prisma/schema.prisma`

Thêm 3 field vào model `Page`, sau dòng `description`:

```prisma
model Page {
  id              String   @id @default(uuid())
  title           String
  slug            String   @unique
  description     String?
  metaTitle       String?  // SEO: override <title> tag
  metaDescription String?  // SEO: <meta name="description">
  ogImageUrl      String?  // SEO: <meta property="og:image"> (URL only)
  isPublished     Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  sections Section[]
}
```

**Tạo migration:**

```bash
npx prisma migrate dev --name add_seo_fields
```

---

## Bước 2: Update DTOs

### CreatePageDto

**File:** `src/pages/dto/create-page.dto.ts`

Thêm 3 field optional:

```typescript
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
  ArrayMaxSize,
  ValidateNested,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSectionDto } from '../../sections/dto/create-section.dto';

export class CreatePageDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsString()
  @IsOptional()
  description?: string;

  // SEO fields
  @IsString()
  @IsOptional()
  @MaxLength(255)
  metaTitle?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  metaDescription?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2048)
  ogImageUrl?: string;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => CreateSectionDto)
  sections?: CreateSectionDto[];
}
```

### UpdatePageDto

**File:** `src/pages/dto/update-page.dto.ts`

```typescript
import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePageDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  // SEO fields
  @ApiProperty({ required: false, maxLength: 255 })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  metaTitle?: string;

  @ApiProperty({ required: false, maxLength: 500 })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  metaDescription?: string;

  @ApiProperty({ required: false, maxLength: 2048 })
  @IsString()
  @IsOptional()
  @MaxLength(2048)
  ogImageUrl?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}
```

---

## Bước 3: Service — KHÔNG cần sửa

`PagesService.create()` và `update()` đã spread DTO fields vào Prisma. Các field mới sẽ tự động được lưu.

---

## Bước 4: Unit Tests

**File:** `src/pages/pages.service.spec.ts`

### 4a. Update mockPage — thêm SEO fields

```typescript
const mockPage = {
  id: 'page-1',
  title: 'Test Page',
  slug: 'test-page',
  description: 'A test page',
  metaTitle: null,
  metaDescription: null,
  ogImageUrl: null,
  isPublished: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  sections: [],
};
```

### 4b. Thêm test case cho SEO fields

```typescript
it('should create a page with SEO fields', async () => {
  const pageWithSeo = {
    ...mockPage,
    metaTitle: 'Custom SEO Title',
    metaDescription: 'SEO description for search engines',
    ogImageUrl: 'https://example.com/og-image.jpg',
  };
  prisma.page.create.mockResolvedValue(pageWithSeo);

  const result = await service.create({
    title: 'Test Page',
    slug: 'test-page',
    metaTitle: 'Custom SEO Title',
    metaDescription: 'SEO description for search engines',
    ogImageUrl: 'https://example.com/og-image.jpg',
  });

  expect(prisma.page.create).toHaveBeenCalledWith({
    data: {
      title: 'Test Page',
      slug: 'test-page',
      metaTitle: 'Custom SEO Title',
      metaDescription: 'SEO description for search engines',
      ogImageUrl: 'https://example.com/og-image.jpg',
    },
    include: { sections: { orderBy: { order: 'asc' } } },
  });
  expect(result.metaTitle).toBe('Custom SEO Title');
});

it('should update page SEO fields', async () => {
  prisma.page.findUnique.mockResolvedValue(mockPage);
  prisma.page.update.mockResolvedValue({
    ...mockPage,
    metaTitle: 'Updated SEO Title',
  });

  const result = await service.update('page-1', {
    metaTitle: 'Updated SEO Title',
  });

  expect(prisma.page.update).toHaveBeenCalledWith({
    where: { id: 'page-1' },
    data: { metaTitle: 'Updated SEO Title' },
  });
  expect(result.metaTitle).toBe('Updated SEO Title');
});
```

---

## Bước 5: Kiểm tra

```bash
# Migration
npx prisma migrate dev --name add_seo_fields

# Unit tests
npm run test

# E2E tests (nếu có)
npm run test:e2e
```

---

## Tại sao KHÔNG cần sửa Controller/Service?

- Controller dùng `@Body() dto: UpdatePageDto` — DTO mới có thêm field, NestJS tự động nhận
- Service dùng `data: dto` trong Prisma call — field mới tự động được lưu
- `findBySlug` trả về tất cả fields (include sections) — SEO fields tự động có trong response
- FE public page sẽ dùng `page.metaTitle`, `page.metaDescription`, `page.ogImageUrl` trong `generateMetadata`
