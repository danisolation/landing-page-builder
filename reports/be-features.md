# Báo cáo Backend — Tất cả tính năng

> Tech: NestJS 11, Prisma 7, PostgreSQL 16, Passport/JWT, bcrypt, Docker
> Thời gian: 2026-08-20 → 2026-08-29

---

## Tổng quan

Backend là REST API cho CRUD pages/sections + xác thực JWT. Xây dựng với NestJS 11, Prisma 7 (driver adapter), PostgreSQL 16 (Docker).

---

## Tính năng theo thứ tự phát triển

### 1. Project Setup (2026-08-20)

**Commit**: `52d29a1`

Setup ban đầu cho backend.

**Tech Stack**:
- NestJS 11 (TypeScript, ES2023, nodenext)
- Prisma 7 với driver adapter (`@prisma/adapter-pg`)
- PostgreSQL 16 qua Docker
- Passport + JWT + bcrypt

**Cấu trúc**:
```
src/
├── main.ts              ← Bootstrap (CORS, ValidationPipe, port 3000)
├── app.module.ts         ← Root module
├── prisma/               ← Database layer
├── auth/                 ← Auth module
├── pages/                ← Pages CRUD module
└── sections/             ← Sections CRUD module
```

---

### 2. Database Schema (2026-08-20)

**Commit**: `52d29a1`

Prisma schema với 3 models.

```prisma
model Page {
  id          String    @id @default(uuid())
  title       String
  slug        String    @unique
  description String?
  isPublished Boolean   @default(false)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  sections    Section[]
}

model Section {
  id        String   @id @default(uuid())
  type      String               // "hero", "features", "cta", "stats", "testimonials"
  content   Json                 // Flexible JSON blob
  order     Int
  pageId    String
  page      Page     @relation(fields: [pageId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Admin {
  id        String   @id @default(uuid())
  username  String   @unique
  password  String               // bcrypt hash
  createdAt DateTime @default(now())
}
```

**Quan hệ**: Page 1───* Section (cascade delete). Admin standalone.

---

### 3. Prisma Service (2026-08-20)

**Commit**: `52d29a1`

Global PrismaService với Prisma 7 driver adapter.

```typescript
// prisma.service.ts
@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const connectionString = process.env.DATABASE_URL;
    const adapter = new PrismaPg({ connectionString });
    super({ adapter });
  }
}
```

**Pattern**:
- `@Global()` decorator → inject ở bất kỳ đâu
- Prisma 7 driver adapter (không dùng built-in query engine)
- Singleton instance

---

### 4. Pages CRUD API (2026-08-20)

**Commit**: `fb1a21d`

REST API cho CRUD pages.

**Endpoints**:
| Method | Path | Description |
|---|---|---|
| `POST` | `/pages` | Tạo page |
| `GET` | `/pages` | List tất cả pages (kèm sections) |
| `GET` | `/pages/:id` | Lấy 1 page |
| `PATCH` | `/pages/:id` | Sửa page |
| `DELETE` | `/pages/:id` | Xóa page (cascade sections) |

**Pattern**:
```
Controller → Service → Prisma
    ↓           ↓
  Route      Business Logic → Database
```

**Existence Check**:
```typescript
async update(id: string, dto: UpdatePageDto) {
  await this.findOne(id); // Check tồn tại → 404 nếu không tìm thấy
  return this.prisma.page.update({ where: { id }, data: dto });
}
```

---

### 5. Sections CRUD API (2026-08-20)

**Commit**: `fb1a21d`

REST API cho CRUD sections (nested dưới pages).

**Endpoints**:
| Method | Path | Description |
|---|---|---|
| `POST` | `/pages/:pageId/sections` | Tạo section |
| `GET` | `/pages/:pageId/sections` | List sections (ordered) |
| `GET` | `/pages/:pageId/sections/:id` | Lấy 1 section |
| `PATCH` | `/pages/:pageId/sections/:id` | Sửa section |
| `DELETE` | `/pages/:pageId/sections/:id` | Xóa section |

**Scoped to Page**:
```typescript
async findAll(pageId: string) {
  return this.prisma.section.findMany({
    where: { pageId },
    orderBy: { order: 'asc' },
  });
}
```

---

### 6. Slug Lookup API (2026-08-20)

**Commit**: `52ab359`

API tìm page theo slug cho public landing page.

**Endpoint**: `GET /pages/slug/:slug`

```typescript
async findBySlug(slug: string) {
  const page = await this.prisma.page.findUnique({
    where: { slug },
    include: { sections: { orderBy: { order: 'asc' } } },
  });
  if (!page) throw new NotFoundException(`Page with slug "${slug}" not found`);
  return page;
}
```

---

### 7. Auth API with JWT (2026-08-20)

**Commit**: `9ecdbb5`

Hệ thống xác thực bằng JWT token.

**Endpoints**:
| Method | Path | Auth | Description |
|---|---|:---:|---|
| `POST` | `/auth/register` | ❌ | Tạo admin |
| `POST` | `/auth/login` | ❌ | Login → JWT token |
| `GET` | `/auth/profile` | ✅ | Lấy profile |

**Auth Service**:
```typescript
// register
async register(username: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);
  return this.prisma.admin.create({ data: { username, password: hashedPassword } });
}

// login
async login(dto: LoginDto) {
  const admin = await this.prisma.admin.findUnique({ where: { username: dto.username } });
  if (!admin) throw new UnauthorizedException('Sai username hoặc password');
  const isValid = await bcrypt.compare(dto.password, admin.password);
  if (!isValid) throw new UnauthorizedException('Sai username hoặc password');
  const payload = { sub: admin.id, username: admin.username };
  return { access_token: await this.jwtService.signAsync(payload) };
}
```

**JWT Strategy**:
```typescript
// jwt.strategy.ts
super({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  ignoreExpiration: false,
  secretOrKey: configService.get<string>('JWT_SECRET', 'default-secret'),
});

async validate(payload: any) {
  return { id: payload.sub, username: payload.username };
}
```

---

### 8. CORS Configuration (2026-08-20)

**Commit**: `1f045a4`

CORS chỉ cho phép frontend gọi API.

```typescript
// main.ts
app.enableCors({
  origin: 'http://localhost:3001', // Chỉ cho FE
});
```

---

### 9. Global ValidationPipe (2026-08-20)

**Commit**: `52d29a1`

ValidationPipe global cho tất cả endpoints.

```typescript
// main.ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,              // Bỏ field không có trong DTO
  forbidNonWhitelisted: true,   // Báo lỗi nếu có field lạ
}));
```

**DTOs**:
- `CreatePageDto` — title (required), slug (required), description (optional), isPublished (optional)
- `UpdatePageDto` — tất cả optional
- `CreateSectionDto` — type (required), content (required), order (required)
- `UpdateSectionDto` — tất cả optional
- `LoginDto` — username (required), password (required)

---

### 10. Seed Data (2026-08-20 → 2026-08-28)

**Commits**: `5e51b81`, `fd78a9d`

Seed data mẫu cho development.

**Admin**: `admin` / `123456`

**Pages** (5 pages):
| # | Title | Slug | Status | Sections |
|---|---|---|---|---|
| 1 | Sản phẩm mới | san-pham-moi | Published | 5 (hero, features, stats, testimonials, cta) |
| 2 | Dịch vụ | dich-vu | Published | 3 (hero, features, cta) |
| 3 | Về chúng tôi | ve-chung-toi | Draft | 3 (hero, stats, testimonials) |
| 4 | Bảng giá | bang-gia | Published | 4 (hero, features, testimonials, cta) |
| 5 | Campaign mùa hè | campaign-mua-he | Draft | 0 |

---

### 11. JWT Auth Guard (2026-08-29)

**Commit**: `724fb80`

Bảo vệ Page/Section endpoints bằng JWT authentication.

**Implementation**:

**@Public() Decorator**:
```typescript
// public.decorator.ts
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

**JwtAuthGuard**:
```typescript
// jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) { super(); }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;  // Bypass auth
    return super.canActivate(context);  // Passport JWT verify
  }
}
```

**APP_GUARD** (global):
```typescript
// app.module.ts
{
  provide: APP_GUARD,
  useClass: JwtAuthGuard,
}
```

**ConfigService** (async JWT config):
```typescript
// auth.module.ts
JwtModule.registerAsync({
  useFactory: (configService: ConfigService) => ({
    secret: configService.get<string>('JWT_SECRET', 'default-secret'),
    signOptions: { expiresIn: '1d' },
  }),
  inject: [ConfigService],
})
```

**Endpoints**:
| Endpoint | Auth |
|---|---|
| `POST /auth/login` | ❌ @Public() |
| `POST /auth/register` | ❌ @Public() |
| `GET /` | ❌ @Public() |
| `GET /pages/slug/:slug` | ❌ @Public() |
| `GET /pages` | ✅ need token |
| `GET /pages/:id` | ✅ need token |
| `POST /pages` | ✅ need token |
| `PATCH /pages/:id` | ✅ need token |
| `DELETE /pages/:id` | ✅ need token |
| `ALL /pages/:pageId/sections/*` | ✅ need token |

**Chi tiết**: Xem `reports/auth-guard-implementation.md`

---

## Thống kê

```
Modules:          3 (Auth, Pages, Sections)
Controllers:      3
Services:         3
DTOs:             5
Guards:           1 global guard
Decorators:       1 custom decorator (@Public)
Models:           3 (Page, Section, Admin)
Endpoints:        15
```

---

## Files chính

| File | Purpose |
|---|---|
| `src/main.ts` | Bootstrap: CORS, ValidationPipe, port 3000 |
| `src/app.module.ts` | Root module: imports, APP_GUARD |
| `src/prisma/prisma.service.ts` | PrismaClient + PgAdapter |
| `src/auth/auth.module.ts` | JWT config (async, ConfigService) |
| `src/auth/auth.controller.ts` | Login, register, profile routes |
| `src/auth/auth.service.ts` | Auth business logic |
| `src/auth/jwt.strategy.ts` | Passport JWT strategy |
| `src/auth/jwt-auth.guard.ts` | Auth guard with @Public() |
| `src/auth/public.decorator.ts` | @Public() decorator |
| `src/pages/pages.controller.ts` | Pages CRUD routes |
| `src/pages/pages.service.ts` | Pages business logic |
| `src/sections/sections.controller.ts` | Sections CRUD routes |
| `src/sections/sections.service.ts` | Sections business logic |
| `prisma/schema.prisma` | Database schema |
| `prisma/seed.ts` | Seed data |
| `docker-compose.yml` | PostgreSQL container |

---

## API Reference

### Authentication

```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'
# Response: { "access_token": "eyJhbG..." }

# Profile (need token)
curl http://localhost:3000/auth/profile \
  -H "Authorization: Bearer <token>"
```

### Pages

```bash
# List pages (need token)
curl http://localhost:3000/pages \
  -H "Authorization: Bearer <token>"

# Get page by slug (public)
curl http://localhost:3000/pages/slug/san-pham-moi

# Create page (need token)
curl -X POST http://localhost:3000/pages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title":"New Page","slug":"new-page"}'

# Update page (need token)
curl -X PATCH http://localhost:3000/pages/<id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title":"Updated Title"}'

# Delete page (need token)
curl -X DELETE http://localhost:3000/pages/<id> \
  -H "Authorization: Bearer <token>"
```

### Sections

```bash
# List sections (need token)
curl http://localhost:3000/pages/<pageId>/sections \
  -H "Authorization: Bearer <token>"

# Create section (need token)
curl -X POST http://localhost:3000/pages/<pageId>/sections \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"type":"hero","content":{"heading":"Welcome"},"order":0}'
```
