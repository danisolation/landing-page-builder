# Báo cáo: BE Production Readiness

> Audit date: 2026-08-29
> Based on: NestJS best practices, Medusa, Vendure, Chatwoot patterns

---

## Tổng quan

Backend hiện tại đã có basic CRUD + auth, nhưng chưa đạt chuẩn production. Dưới đây là danh sách những gì cần implement, ưu tiên theo mức độ.

---

## P0 — Critical (làm ngay)

### 1. RegisterDto với validation

**Hiện tại**: `/auth/register` dùng inline type `{ username: string; password: string }`, không validate.

**Cần làm**:
```typescript
// src/modules/auth/dto/register.dto.ts
export class RegisterDto {
  @ApiProperty({ example: 'admin' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(100)
  password: string;
}
```

**File sửa**: `auth.controller.ts` — đổi `@Body() body` → `@Body() dto: RegisterDto`

---

### 2. JWT secret phải fail fast

**Hiện tại**: `configService.get('JWT_SECRET', 'default-secret')` — silent fallback.

**Cần làm**:
```typescript
// Nếu thiếu JWT_SECRET → throw error khi startup
const jwtSecret = configService.get<string>('JWT_SECRET');
if (!jwtSecret) {
  throw new Error('JWT_SECRET is required');
}
```

**File sửa**: `auth.module.ts`, `jwt.strategy.ts`

---

### 3. Register không trả password hash

**Hiện tại**: `auth.service.register()` trả full admin record gồm password hash.

**Cần làm**:
```typescript
async register(username: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const admin = await this.prisma.admin.create({
    data: { username, password: hashedPassword },
    select: { id: true, username: true, createdAt: true }, // ← KHÔNG trả password
  });
  return admin;
}
```

**File sửa**: `auth.service.ts`

---

### 4. Enable shutdown hooks

**Hiện tại**: Không có `app.enableShutdownHooks()`.

**Cần làm**:
```typescript
// main.ts
app.enableShutdownHooks();
```

**File sửa**: `main.ts`

---

## P1 — High (nên làm sớm)

### 5. Global Exception Filter cho Prisma errors

**Hiện tại**: Prisma errors (P2002 duplicate slug) → raw 500.

**Cần làm**:
- Tạo `src/common/filters/prisma-exception.filter.ts`
- Map Prisma error codes → user-friendly HTTP responses
- Register trong `main.ts`: `app.useGlobalFilters(new PrismaExceptionFilter())`

---

### 6. Rate Limiting

**Hiện tại**: Không có rate limiting.

**Cần làm**:
```bash
npm install @nestjs/throttler
```

```typescript
// app.module.ts
ThrottlerModule.forRoot([{ ttl: 60000, limit: 30 }])

// auth.controller.ts — stricter cho login
@Throttle({ default: { limit: 5, ttl: 60000 } })
@Post('login')
```

---

### 7. CORS từ env var

**Hiện tại**: Hardcode `http://localhost:3001`.

**Cần làm**:
```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true,
});
```

**File sửa**: `main.ts`, `.env` (thêm `FRONTEND_URL`)

---

### 8. Env validation

**Hiện tại**: Không validate env vars. Thiếu `DATABASE_URL` → crash không rõ nguyên nhân.

**Cần làm**:
- Tạo `src/config/env.validation.ts` với `class-validator`
- Register trong `ConfigModule.forRoot({ validate })`

---

### 9. Input Sanitization (XSS)

**Hiện tại**: Section content chứa `<script>` → lưu vào DB → render trên public page.

**Cần làm**:
```bash
npm install sanitize-html
```

```typescript
// Tạo utility sanitizeContent()
// Áp dụng trước khi lưu section.content vào DB
```

---

## P2 — Medium (nâng cao)

### 10. Swagger/OpenAPI

```bash
npm install @nestjs/swagger
```

**Cần làm**:
- Setup `SwaggerModule` trong `main.ts`
- Thêm `@ApiProperty()` trên tất cả DTOs
- Thêm `@ApiTags()`, `@ApiOperation()`, `@ApiResponse()` trên controllers
- Docs tại `http://localhost:3000/api/docs`

---

### 11. Logging

**Cần làm**:
- Dùng `Logger` class trong services
- Tạo `LoggingInterceptor` cho request logging
- Log format: `GET /pages 200 45ms userId=abc`

---

### 12. Response Wrapper

**Cần làm**:
- Tạo `ResponseInterceptor` → wrap response trong `{ success, data, timestamp }`
- Register trong `main.ts`

---

### 13. Health Check

```bash
npm install @nestjs/terminus
```

**Cần làm**:
- Tạo `HealthController`
- Check DB connectivity: `prisma.$queryRaw`SELECT 1``
- Endpoint: `GET /health` → `{ status: "ok", db: "connected" }`

---

### 14. Slug format validation

**Hiện tại**: `CreatePageDto.slug` chấp nhận bất kỳ string nào.

**Cần làm**:
```typescript
@Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
  message: 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang',
})
slug: string;
```

---

### 15. Section type enum validation

**Hiện tại**: `CreateSectionDto.type` chấp nhận bất kỳ string nào.

**Cần làm**:
```typescript
@IsIn(['hero', 'features', 'cta', 'stats', 'testimonials'])
type: string;
```

---

### 16. @MaxLength trên tất cả string fields

**Hiện tại**: Không có giới hạn độ dài.

**Cần làm**: Thêm `@MaxLength(255)` hoặc `@MaxLength(500)` trên tất cả string DTO fields.

---

## P3 — Low (khi nào rảnh)

### 17. API Versioning

```typescript
app.enableVersioning({
  type: VersioningType.URI, // /v1/pages
  defaultVersion: '1',
});
```

---

### 18. Unit Tests

- `pages.service.spec.ts`
- `sections.service.spec.ts`
- `auth.service.spec.ts`
- Coverage target: 80%+

---

### 19. E2E Tests

- `test/pages.e2e-spec.ts`
- `test/auth.e2e-spec.ts`
- `test/sections.e2e-spec.ts`

---

### 20. Typed JWT Payload

```typescript
interface JwtPayload {
  sub: string;
  username: string;
  iat: number;
  exp: number;
}
```

---

## Implementation Order

```
Week 1: P0 (1-4)
Week 2: P1 (5-9)
Week 3: P2 (10-16)
Week 4: P3 (17-20)
```

---

## Dependencies cần cài

```bash
# P1
npm install @nestjs/throttler sanitize-html

# P2
npm install @nestjs/swagger @nestjs/terminus

# Dev
npm install --save-dev @types/sanitize-html
```
