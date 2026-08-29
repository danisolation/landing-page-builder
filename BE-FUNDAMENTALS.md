# Backend Fundamentals — Hướng dẫn cho FE Developer

> Mọi thứ bạn cần biết về Backend, giải thích từ gốc đến ngọn.
> Mỗi phần đều có **"Tại sao?"** — vì hiểu lý do quan trọng hơn biết cách làm.

---

## Mục lục

1. [Server là gì?](#1-server-là-gì)
2. [HTTP Request/Response Cycle](#2-http-requestresponse-cycle)
3. [REST API Design](#3-rest-api-design)
4. [Database — Tại sao cần?](#4-database--tại-sao-cần)
5. [PostgreSQL — Chi tiết](#5-postgresql--chi-tiết)
6. [ORM — Tại sao dùng Prisma?](#6-orm--tại-sao-dùng-prisma)
7. [NestJS Architecture](#7-nestjs-architecture)
8. [Dependency Injection — Tại sao?](#8-dependency-injection--tại-sao)
9. [Authentication & Authorization](#9-authentication--authorization)
10. [Error Handling](#10-error-handling)
11. [Validation](#11-validation)
12. [CORS — Tại sao cần?](#12-cors--tại-sao-cần)
13. [Environment Variables](#13-environment-variables)
14. [Database Migrations](#14-database-migrations)
15. [Seed Data](#15-seed-data)

---

## 1. Server là gì?

### Định nghĩa
Server là một chương trình **chờ đợi request** từ client và **trả về response**.

### Ví dụ đời thường
```
Client (FE) = Khách hàng trong nhà hàng
Server (BE) = Bếp + Nhân viên

1. Khách hàng (Client) gọi món → Gửi request
2. Nhân viên (Router) nhận order → Chuyển đến bếp
3. Bếp (Service) nấu ăn → Xử lý logic
4. Nhân viên mang thức ăn ra → Trả response
```

### Code ví dụ
```javascript
// Server đơn giản nhất (không dùng framework)
const http = require('http');

const server = http.createServer((req, res) => {
  // req = request (khách hàng gọi gì?)
  // res = response (mình trả gì?)

  if (req.url === '/pages' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify([{ id: 1, title: 'Page 1' }]));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(3000); // Chờ request trên port 3000
```

### Tại sao cần Server?
```
Không có Server:                    Có Server:
───────────────                    ──────────
FE gọi API bên thứ 3               FE gọi API của chính mình
(Google Sheets, Firebase...)       (NestJS server)

- Không kiểm soát data             - Kiểm soát hoàn toàn
- Giới hạn features                - Tự do thêm features
- Phụ thuộc dịch vụ khác           - Độc lập
- Không bảo mật được               - Bảo mật theo ý muốn
```

---

## 2. HTTP Request/Response Cycle

### Flow chi tiết

```
Client (Browser/FE)                Server (NestJS)
      │                                │
      │── 1. DNS Resolution ──────────→│ (domain → IP)
      │── 2. TCP Handshake ──────────→│ (kết nối)
      │── 3. HTTP Request ───────────→│
      │   ┌─────────────────────┐     │
      │   │ GET /pages HTTP/1.1 │     │
      │   │ Host: localhost:3000│     │
      │   │ Authorization:      │     │
      │   │ Bearer eyJhb...     │     │
      │   │ Content-Type:       │     │
      │   │ application/json    │     │
      │   └─────────────────────┘     │
      │                                │── 4. Parse request
      │                                │── 5. Route matching
      │                                │── 6. Guard (auth check)
      │                                │── 7. Controller
      │                                │── 8. Service (business logic)
      │                                │── 9. Database query
      │                                │── 10. Format response
      │←── 11. HTTP Response ─────────│
      │   ┌─────────────────────┐     │
      │   │ HTTP/1.1 200 OK     │     │
      │   │ Content-Type:       │     │
      │   │ application/json    │     │
      │   │                     │     │
      │   │ [{"id":"1",...}]    │     │
      │   └─────────────────────┘     │
```

### Request Components

```typescript
// FE gửi request
fetch('http://localhost:3000/pages', {
  method: 'POST',                    // ← HTTP Method
  headers: {                         // ← Headers (metadata)
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhb...'
  },
  body: JSON.stringify({             // ← Body (data)
    title: 'New Page',
    slug: 'new-page'
  })
});

// BE nhận được:
// Method: POST
// URL: /pages
// Headers: { Content-Type, Authorization }
// Body: { title: 'New Page', slug: 'new-page' }
```

### Response Components

```typescript
// BE trả về:
res.status(201).json({      // Status code + Body
  id: 'uuid-here',
  title: 'New Page',
  slug: 'new-page'
});

// FE nhận được:
// Status: 201 (Created)
// Body: { id: 'uuid-here', title: 'New Page', slug: 'new-page' }
```

### Status Codes — Ý nghĩa

```
2xx = Thành công
├── 200 OK              — GET thành công
├── 201 Created         — POST thành công (tạo mới)
└── 204 No Content      — DELETE thành công (không có body)

4xx = Lỗi Client (FE gửi sai)
├── 400 Bad Request     — Data không hợp lệ (thiếu field, sai format)
├── 401 Unauthorized    — Chưa đăng nhập (không có token)
├── 403 Forbidden       — Đăng nhập nhưng không có quyền
├── 404 Not Found       — Resource không tồn tại
└── 409 Conflict        — Trùng dữ liệu (slug đã tồn tại)

5xx = Lỗi Server (BE crash)
└── 500 Internal Server Error — Lỗi không xác định (bug ở BE)
```

---

## 3. REST API Design

### Nguyên tắc REST

```
Resource = "thing" (Page, Section, User)
Endpoint = URL path
Method   = Hành động (GET, POST, PATCH, DELETE)

┌──────────┬─────────────────────────┬─────────────────┐
│ Method   │ Endpoint                │ Ý nghĩa         │
├──────────┼─────────────────────────┼─────────────────┤
│ GET      │ /pages                  │ Lấy tất cả      │
│ GET      │ /pages/:id              │ Lấy 1 page      │
│ POST     │ /pages                  │ Tạo page mới    │
│ PATCH    │ /pages/:id              │ Sửa page        │
│ DELETE   │ /pages/:id              │ Xóa page        │
├──────────┼─────────────────────────┼─────────────────┤
│ GET      │ /pages/:pageId/sections │ Lấy sections    │
│ POST     │ /pages/:pageId/sections │ Tạo section     │
│ PATCH    │ /pages/:pageId/sections/:id │ Sửa section │
│ DELETE   │ /pages/:pageId/sections/:id │ Xóa section │
└──────────┴─────────────────────────┴─────────────────┘
```

### Tại sao dùng PATCH thay vì PUT?
```
PUT    = Thay thế TOÀN BỘ resource (gửi hết tất cả fields)
PATCH  = Thay thế MỘT PHẦN resource (chỉ gửi fields cần sửa)

Ví dụ: Page có { title, slug, description, isPublished }

PUT /pages/123 → Phải gửi { title, slug, description, isPublished }
PATCH /pages/123 → Chỉ cần { title: 'New title' }
```

### Nested Routes
```
/pages/:pageId/sections
  ↑        ↑         ↑
Resource  Parent    Child

Tại sao nested? Vì section THUỘC page.
Không thể tạo section mà không có page.
```

---

## 4. Database — Tại sao cần?

### FE vs BE: Lưu trữ dữ liệu

```
FE (Frontend)                   BE (Backend)
──────────────                 ──────────────
useState()     → RAM, mất      Database     → Ổ đĩa, vĩnh viễn
               khi refresh

localStorage   → Browser,      PostgreSQL   → Server, ai cũng
               chỉ 1 user                     truy cập được

cookies        → Browser,      Redis        → RAM, nhanh,
               giới hạn size                  cache tạm thời
```

### Tại sao không dùng localStorage cho BE?

```
localStorage:
- Lưu trên browser của MỘT user
- Không chia sẻ được giữa users
- Giới hạn ~5MB
- Không query được (không thể tìm "tất cả pages có title chứa 'ABC'")
- Không có quan hệ (không thể "lấy tất cả sections của page X")

Database:
- Lưu trên server, MỌI user đều truy cập
- Không giới hạn dung lượng
- Query mạnh mẽ (SELECT * FROM pages WHERE title LIKE '%ABC%')
- Có quan hệ (JOIN pages và sections)
- Có index (tìm kiếm nhanh)
- Có transaction (đảm bảo data consistency)
```

### Các loại Database

```
┌─────────────────────────────────────────────────────────┐
│                    Databases                             │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ Relational  │  │ Document    │  │ Key-Value   │    │
│  │ (SQL)       │  │ (NoSQL)     │  │ (Cache)     │    │
│  │             │  │             │  │             │    │
│  │ PostgreSQL  │  │ MongoDB     │  │ Redis       │    │
│  │ MySQL       │  │ CouchDB     │  │ Memcached   │    │
│  │ SQLite      │  │             │  │             │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                         │
│  Tables, rows,               Documents,               Key → Value
│  SQL queries                 JSON-like                (simple, fast)
└─────────────────────────────────────────────────────────┘
```

---

## 5. PostgreSQL — Chi tiết

### Tại sao chọn PostgreSQL cho dự án này?

```
PostgreSQL vs MySQL vs SQLite:

Feature              PostgreSQL    MySQL      SQLite
─────────────────    ──────────    ─────      ──────
JSON support         ✅ Native     ⚠️ Basic   ❌ None
Full-text search     ✅ Built-in   ⚠️ Limited ❌ None
UUID support         ✅ Native     ⚠️ Manual  ❌ None
ACID compliance      ✅ Full       ✅ Full    ✅ Full
Performance          ✅ Excellent  ✅ Good    ✅ Good (small)
Scalability          ✅ Excellent  ✅ Good    ❌ Limited
Cost                 Free          Free       Free
Docker support       ✅            ✅         ❌ (file-based)
```

### Kết nối Database

```
Connection String:
postgresql://postgres:postgres@localhost:5432/landing_page
    ↑          ↑        ↑         ↑        ↑       ↑
  Protocol  Username  Password   Host    Port   Database

Trong code:
const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } }
});
```

### SQL cơ bản cho dự án này

```sql
-- Lấy tất cả pages (kèm sections)
SELECT p.*, s.*
FROM pages p
LEFT JOIN sections s ON p.id = s."pageId"
ORDER BY p."createdAt" DESC, s."order" ASC;

-- Tạo page mới
INSERT INTO pages (id, title, slug, description, "isPublished")
VALUES (gen_random_uuid(), 'New Page', 'new-page', 'Description', false);

-- Sửa page
UPDATE pages SET title = 'Updated' WHERE id = 'uuid-here';

-- Xóa page (cascade sẽ xóa sections tự động)
DELETE FROM pages WHERE id = 'uuid-here';
```

---

## 6. ORM — Tại sao dùng Prisma?

### Không dùng ORM (viết SQL thuần)

```typescript
// Phải viết SQL string → dễ typo, không type-safe
const result = await db.query(
  'SELECT * FROM pages WHERE id = $1',
  [id]
);
// result.rows[0].title → any type, không autocomplete
```

### Dùng Prisma ORM

```typescript
// Viết như code → type-safe, autocomplete
const page = await prisma.page.findUnique({
  where: { id },
  include: { sections: true }
});
// page.title → string type, autocomplete hoạt động
```

### Tại sao chọn Prisma?

```
Prisma vs TypeORM vs Sequelize:

Feature              Prisma        TypeORM      Sequelize
─────────────────    ──────────    ────────     ──────────
Type safety          ✅ Excellent  ⚠️ Good      ❌ Poor
Autocomplete         ✅ Full       ⚠️ Partial   ❌ None
Schema definition    ✅ .prisma    ⚠️ Decorator  ⚠️ Model
Migration            ✅ Built-in   ✅ Built-in   ✅ Built-in
Learning curve       ✅ Easy       ⚠️ Medium    ⚠️ Medium
Documentation        ✅ Excellent  ⚠️ Good      ⚠️ Good
Community            ✅ Large      ✅ Large      ✅ Large
```

### Prisma Workflow

```
1. Định nghĩa schema (schema.prisma)
   ↓
2. Tạo migration (npx prisma migrate dev)
   ↓
3. Generate client (npx prisma generate)
   ↓
4. Dùng trong code (prisma.page.findMany())
```

---

## 7. NestJS Architecture

### Request Flow trong NestJS

```
Request từ Client
      │
      ▼
┌─────────────┐
│  Middleware  │  ← CORS, logging, body parsing
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Guards     │  ← Auth check (JWT verification)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Interceptors│  ← Transform response, logging
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Pipes      │  ← Validation, transformation
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Controller  │  ← Route handling (nhận request)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Service    │  ← Business logic (xử lý dữ liệu)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Prisma     │  ← Database access (query DB)
└─────────────┘
```

### Tại sao tách Controller và Service?

```
Controller: "Nhận request, trả response" (như React component)
Service: "Xử lý logic" (như custom hook)

// ❌ Gộp chung — khó test, khó reuse
class PagesController {
  findAll() {
    // Parse request
    // Query database
    // Format response
    // Handle errors
    // ... 50 dòng code
  }
}

// ✅ Tách riêng — dễ test, dễ reuse
class PagesController {
  constructor(private service: PagesService) {}

  findAll() {
    return this.service.findAll(); // Gọi service
  }
}

class PagesService {
  findAll() {
    return this.prisma.page.findMany(); // Logic ở đây
  }
}
```

---

## 8. Dependency Injection — Tại sao?

### Không dùng DI

```typescript
// Phải tự tạo instance → tightly coupled
class PagesController {
  private prisma = new PrismaService();      // Tự tạo
  private service = new PagesService(this.prisma); // Tự inject

  // Vấn đề:
  // 1. Khó test (không thể mock PrismaService)
  // 2. Khó thay đổi (muốn đổi DB? Phải sửa code)
  // 3. Khó reuse (nhiều controller dùng PrismaService → tạo nhiều instance)
}
```

### Dùng DI

```typescript
// NestJS tự tạo và inject → loosely coupled
class PagesController {
  constructor(private readonly service: PagesService) {}
  // NestJS tự:
  // 1. Tạo PrismaService (singleton)
  // 2. Tạo PagesService (inject PrismaService)
  // 3. Inject PagesService vào PagesController
}

// Lợi ích:
// 1. Dễ test (mock PagesService)
// 2. Dễ thay đổi (đổi implementation không cần sửa controller)
// 3. Dễ reuse (PrismaService là singleton, share giữa các controllers)
```

### Ví dụ đời thường

```
Không DI (tự nấu ăn):
- Bạn phải tự mua nguyên liệu
- Bạn phải tự nấu
- Bạn phải tự dọn dẹp
- Muốn đổi món? Phải mua nguyên liệu mới

DI (nhà hàng):
- Bạn chỉ cần gọi món (constructor)
- Nhà hàng tự mua nguyên liệu (NestJS tự tạo service)
- Nhà hàng tự nấu (NestJS tự inject)
- Muốn đổi món? Chỉ cần gọi món khác (đổi parameter)
```

---

## 9. Authentication & Authorization

### Authentication (AuthN) — "Bạn là ai?"

```
Login flow:
1. Client gửi { username, password }
2. Server tìm user trong DB
3. So sánh password (bcrypt.compare)
4. Nếu đúng → tạo JWT token
5. Trả token về client

Client                    Server
  │                        │
  │── POST /auth/login ───→│
  │   {username, password} │
  │                        │── Tìm user trong DB
  │                        │── bcrypt.compare(password, hash)
  │                        │── Tạo JWT token
  │←── { access_token } ──│
```

### Authorization (AuthZ) — "Bạn có quyền gì?"

```
Guard flow:
1. Client gửi request với token
2. Guard kiểm tra token có hợp lệ không
3. Nếu hợp lệ → cho request đi tiếp
4. Nếu không hợp lệ → trả 401 Unauthorized

Client                    Guard              Controller
  │                        │                    │
  │── GET /pages ─────────→│                    │
  │   Authorization:       │                    │
  │   Bearer <token>       │                    │
  │                        │── Verify token     │
  │                        │── Token hợp lệ?   │
  │                        │── Yes → ──────────→│
  │                        │                    │── Xử lý
  │←── 200 OK ────────────│←───────────────────│
```

### JWT Token — Cấu trúc

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidXNlcm5hbWUiOiJhZG1pbiJ9.Secret

│                    │                              │
Header              Payload                         Signature
(algorithms)        (data)                          (verification)

Decode payload:
{
  "sub": "1234567890",    // User ID
  "username": "admin",    // Username
  "iat": 1234567890,      // Issued at (thời điểm tạo)
  "exp": 1234567890       // Expiration (thời điểm hết hạn)
}
```

### Tại sao dùng JWT thay vì Session?

```
Session-based:
- Server lưu session trong RAM/DB
- Client gửi session ID (cookie)
- Server lookup session → lấy user info
- Vấn đề: Phải lưu session → tốn RAM, khó scale

JWT-based:
- Server tạo token chứa user info
- Client lưu token (localStorage/cookie)
- Server verify token → lấy user info trực tiếp
- Ưu điểm: Không cần lưu → stateless, dễ scale
```

---

## 10. Error Handling

### Tại sao cần xử lý lỗi?

```
Không xử lý lỗi:
- Server crash → 500 Internal Server Error
- User thấy "Something went wrong"
- Không biết lỗi ở đâu

Có xử lý lỗi:
- Server trả lỗi cụ thể → 404 Not Found
- User thấy "Page with id '123' not found"
- Dễ debug
```

### Error Handling trong NestJS

```typescript
// Service — throw NotFoundException
async findOne(id: string) {
  const page = await this.prisma.page.findUnique({ where: { id } });

  if (!page) {
    throw new NotFoundException(`Page with id "${id}" not found`);
    // NestJS tự bắt và trả về:
    // { statusCode: 404, message: 'Page with id "123" not found' }
  }

  return page;
}

// Controller — không cần try/catch (NestJS tự xử lý)
@Get(':id')
findOne(@Param('id') id: string) {
  return this.pagesService.findOne(id);
  // Nếu service throw → NestJS tự catch và trả error response
}
```

### Các loại Exception trong NestJS

```typescript
import {
  BadRequestException,      // 400
  UnauthorizedException,    // 401
  ForbiddenException,       // 403
  NotFoundException,        // 404
  ConflictException,        // 409
  InternalServerErrorException // 500
} from '@nestjs/common';

// Sử dụng
throw new BadRequestException('Invalid data');
throw new NotFoundException('Page not found');
throw new UnauthorizedException('Wrong password');
```

---

## 11. Validation

### Tại sao cần validate?

```
Không validate:
- Client gửi { title: '' } → Server lưu vào DB → Data bẩn
- Client gửi { title: '<script>alert("xss")</script>' } → XSS attack
- Client gửi { hackerField: 'hack' } → Server lưu field lạ

Có validate:
- Client gửi { title: '' } → Server reject: "Title is required"
- Client gửi { title: '<script>...' } → Server reject: "Invalid characters"
- Client gửi { hackerField: 'hack' } → Server reject: "Unknown field"
```

### Validation trong NestJS

```typescript
// DTO (Data Transfer Object) — định nghĩa shape của data
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreatePageDto {
  @IsString()
  title: string;           // Bắt buộc, phải là string

  @IsString()
  slug: string;            // Bắt buộc, phải là string

  @IsOptional()
  @IsString()
  description?: string;    // Tùy chọn

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;   // Tùy chọn
}

// Global ValidationPipe trong main.ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,              // Bỏ field không có trong DTO
  forbidNonWhitelisted: true,   // Báo lỗi nếu có field lạ
}));
```

### So sánh với FE

``FE (Zod)                    BE (class-validator)
──────────                  ──────────────────
const schema = z.object({   export class CreatePageDto {
  title: z.string(),           @IsString()
  slug: z.string(),            title: string;
})                           }

schema.parse(data)           ValidationPipe tự validate
```

---

## 12. CORS — Tại sao cần?

### Vấn đề

```
Browser có Same-Origin Policy:
- FE chạy ở localhost:3001
- BE chạy ở localhost:3000
- Browser chặn request từ 3001 → 3000 (khác port = khác origin)

Không có CORS:
fetch('http://localhost:3000/pages')
→ Error: Blocked by CORS policy
```

### Giải pháp

```
Server thêm header:
Access-Control-Allow-Origin: http://localhost:3001

Nghĩa là: "Tôi cho phép localhost:3001 gọi API của tôi"
```

### Code trong NestJS

```typescript
// main.ts
app.enableCors({
  origin: 'http://localhost:3001', // Chỉ cho FE gọi
});

// Nếu muốn cho tất cả (không recommended cho production):
app.enableCors({
  origin: '*', // ⚠️ Ai cũng gọi được
});
```

---

## 13. Environment Variables

### Tại sao cần?

```
Không dùng env var:
- Database URL hardcoded trong code
- JWT secret hardcoded trong code
- Commit lên Git → lộ password!

Dùng env var:
- Database URL trong .env file
- .env file KHÔNG commit lên Git
- Code đọc từ process.env.DATABASE_URL
```

### Cách dùng

```bash
# .env file (KHÔNG commit lên Git)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/landing_page"
JWT_SECRET="my-super-secret-key"
PORT=3000
```

```typescript
// Trong code
process.env.DATABASE_URL  // "postgresql://postgres:postgres@localhost:5432/landing_page"
process.env.JWT_SECRET    // "my-super-secret-key"
process.env.PORT          // "3000"
```

### NestJS ConfigModule

```typescript
// app.module.ts
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Load .env
    // ...
  ],
})
export class AppModule {}

// Sử dụng ở bất kỳ đâu
import { ConfigService } from '@nestjs/config';

class AuthService {
  constructor(private configService: ConfigService) {}

  getJwtSecret() {
    return this.configService.get<string>('JWT_SECRET');
  }
}
```

---

## 14. Database Migrations

### Migration là gì?

```
Migration = "Version control cho database"

Git:    Version control cho code
Prisma: Version control cho database schema

Tương tự:
- Git commit: Lưu thay đổi code
- Prisma migration: Lưu thay đổi database
```

### Tại sao cần?

```
Không có migration:
- Bạn sửa schema.prisma (thêm field "email")
- Bạn phải chạy SQL thủ công: ALTER TABLE users ADD COLUMN email VARCHAR(255)
- Teammate cũng phải chạy SQL
- Production cũng phải chạy SQL
- Quên chạy → lỗi!

Có migration:
- Bạn sửa schema.prisma
- Chạy: npx prisma migrate dev
- Prisma tự tạo file migration.sql
- Commit file migration lên Git
- Teammate pull code → chạy migration → DB tự update
- Production deploy → chạy migration → DB tự update
```

### Workflow

```bash
# 1. Sửa schema.prisma (thêm field, thêm model)
model Page {
  id    String @id @default(uuid())
  title String
  email String  // ← Thêm mới
}

# 2. Tạo migration
npx prisma migrate dev --name add_email_to_page
# → Tạo file: prisma/migrations/20260829_add_email_to_page/migration.sql

# 3. Migration tự động chạy trên local DB
# 4. Commit migration file lên Git
# 5. Teammate pull → chạy migration → DB sync
```

---

## 15. Seed Data

### Seed là gì?

```
Seed = Tạo data mẫu cho development

Không có seed:
- Mỗi lần tạo DB mới → phải tạo data thủ công
- Mất thời gian, dễ quên

Có seed:
- Chạy: npx prisma db seed
- Tự động tạo admin, sample pages, sample sections
```

### Seed trong dự án này

```typescript
// prisma/seed.ts
async function main() {
  // 1. Tạo admin
  const admin = await prisma.admin.create({
    data: { username: 'admin', password: hashedPassword }
  });

  // 2. Tạo sample pages với sections
  const page = await prisma.page.create({
    data: { title: 'Sản phẩm mới', slug: 'san-pham-moi' }
  });

  await prisma.section.createMany({
    data: [
      { type: 'hero', content: { heading: 'Welcome' }, order: 0, pageId: page.id },
      { type: 'features', content: { title: 'Features' }, order: 1, pageId: page.id },
    ]
  });
}
```

---

## Tóm tắt: Tại sao mọi thứ hoạt động như vậy?

```
Câu hỏi                              Trả lời
──────────                          ─────────
Tại sao cần Server?                 Để xử lý logic, lưu data, bảo mật
Tại sao cần Database?               Để lưu data vĩnh viễn, query nhanh
Tại sao dùng PostgreSQL?            Miễn phí, mạnh, hỗ trợ JSON
Tại sao dùng ORM (Prisma)?         Type-safe, dễ dùng, migration built-in
Tại sao dùng NestJS?               Structure rõ ràng, DI, guards, pipes
Tại sao cần Auth Guard?            Bảo vệ API, chỉ user đăng nhập mới truy cập
Tại sao dùng JWT?                   Stateless, dễ scale, không cần lưu session
Tại sao cần CORS?                   Browser chặn request cross-origin
Tại sao cần .env?                   Bảo mật secret, không hardcode
Tại sao cần Migration?             Version control cho database
Tại sao cần Seed?                   Tạo data mẫu cho development
```
