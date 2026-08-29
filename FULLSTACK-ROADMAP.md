# Lộ trình FE → Fullstack Developer

> Dành riêng cho bạn — một FE developer muốn mở rộng sang Backend và trở thành Fullstack.

---

## Bạn đang ở đâu?

```
Frontend (Bạn đã biết)          Backend (Bạn sẽ học)
┌─────────────────────┐        ┌─────────────────────┐
│ HTML/CSS/JS    ✅   │        │ Node.js        ⬜   │
│ React/Next.js  ✅   │        │ NestJS         ⬜   │
│ TypeScript     ✅   │        │ TypeScript     ✅   │ ← Cùng ngôn ngữ!
│ REST API       ✅   │ ←───→  │ REST API       ⬜   │ ← Cùng giao thức!
│ Auth (FE side) ✅   │        │ Auth (BE side) ⬜   │
│ Database?      ❌   │        │ PostgreSQL     ⬜   │
│ ORM?           ❌   │        │ Prisma         ⬜   │
│ Server?        ❌   │        │ Docker         ⬜   │
└─────────────────────┘        └─────────────────────┘
```

**Tin tốt**: Bạn đã biết TypeScript và REST API — đây là 2 kiến thức quan trọng nhất khi học BE. Bạn chỉ cần học cách **tạo ra** API thay vì **gọi** API.

---

## Lộ trình học (theo thứ tự ưu tiên)

### Phase 1: Nền tảng (Tuần 1-2)

#### 1.1 Node.js cơ bản
- **Là gì**: JavaScript chạy trên server (không cần browser)
- **Tại sao cần**: NestJS được build trên Node.js
- **Học gì**:
  - `require` / `import` modules
  - File system (`fs` module)
  - HTTP server cơ bản (`http.createServer`)
  - Event loop, async/await
  - npm và package.json

```javascript
// Ví dụ: HTTP server cơ bản (không dùng framework)
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Hello from server!' }));
});

server.listen(3000, () => console.log('Server running on port 3000'));
```

**So sánh với FE**:
- FE: Browser chạy JavaScript → render UI
- BE: Node.js chạy JavaScript → xử lý logic, trả dữ liệu

#### 1.2 HTTP và REST API (sâu hơn)
- **Bạn đã gọi API** → giờ học **cách tạo API**
- **Học gì**:
  - HTTP methods (GET, POST, PATCH, DELETE) — bạn đã biết, giờ hiểu sâu hơn
  - Status codes (200, 201, 400, 401, 404, 500)
  - Request/Response cycle
  - Headers (Content-Type, Authorization)
  - REST conventions (nested routes, resource naming)

```
FE (bạn đã biết)              BE (bạn sẽ học)
─────────────────            ─────────────────
fetch('/api/pages')    →     GET /pages        → findAll()
fetch('/api/pages', {  →     POST /pages       → create()
  method: 'POST',
  body: JSON.stringify(data)
})
```

#### 1.3 Database cơ bản
- **Là gì**: Nơi lưu trữ dữ liệu vĩnh viễn (không như state ở FE, mất khi refresh)
- **Tại sao cần**: FE lưu data ở localStorage/cookies → BE lưu data ở Database
- **Học gì**:
  - SQL cơ bản (SELECT, INSERT, UPDATE, DELETE)
  - Bảng (table), cột (column), dòng (row)
  - Primary key, Foreign key
  - Quan hệ 1-N (Page 1---* Section)

```sql
-- Tạo bảng
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Thêm data
INSERT INTO pages (title, slug) VALUES ('Sản phẩm mới', 'san-pham-moi');

-- Lấy data
SELECT * FROM pages WHERE slug = 'san-pham-moi';
```

**So sánh với FE**:
- FE: `localStorage.setItem('pages', JSON.stringify(pages))` — lưu tạm
- BE: `INSERT INTO pages ...` — lưu vĩnh viễn

---

### Phase 2: NestJS Framework (Tuần 3-4)

#### 2.1 NestJS là gì?
- **Framework** để build server-side applications với TypeScript
- **Tương tự** Next.js nhưng cho backend:
  - Next.js: Framework cho React (FE)
  - NestJS: Framework cho Node.js (BE)

```
Next.js (FE)                  NestJS (BE)
─────────────                ─────────────
page.tsx                     controller.ts    ← Xử lý request
component.tsx                service.ts        ← Business logic
layout.tsx                   module.ts         ← Tổ chức code
middleware.ts                guard.ts          ← Bảo vệ route
useEffect()                  injectable()      ← Dependency Injection
```

#### 2.2 Module Pattern
```
src/
├── auth/                    ← Module xác thực
│   ├── auth.module.ts       ← Module definition
│   ├── auth.controller.ts   ← Route handlers (như page.tsx)
│   ├── auth.service.ts      ← Business logic (như custom hook)
│   └── dto/                 ← Data validation (như Zod schema)
├── pages/                   ← Module quản lý pages
│   ├── pages.module.ts
│   ├── pages.controller.ts
│   ├── pages.service.ts
│   └── dto/
└── sections/                ← Module quản lý sections
    ├── sections.module.ts
    ├── sections.controller.ts
    ├── sections.service.ts
    └── dto/
```

**So sánh với FE**:
```
FE Component                 NestJS Controller
──────────────              ──────────────────
function PageList() {        @Controller('pages')
  const { data } = usePages()  @Get()
  return <div>{data}</div>     findAll() { return this.service.findAll() }
}                            }
```

#### 2.3 Dependency Injection (DI)
- **Là gì**: Thay vì tự tạo object, để framework tạo và inject vào
- **Tại sao**: Dễ test, dễ thay đổi, dễ maintain

```typescript
// ❌ Không dùng DI — tự tạo instance
class PagesController {
  private service = new PagesService(new PrismaService());
  // Phải tự tạo → khó test, khó thay đổi
}

// ✅ Dùng DI — NestJS tự inject
class PagesController {
  constructor(private readonly service: PagesService) {}
  // NestJS tự tạo PagesService và inject vào → dễ test, dễ thay đổi
}
```

**Ví dụ đời thường**:
- Không DI: Bạn tự nấu ăn (phải mua nguyên liệu, nấu, dọn dẹp)
- DI: Nhà hàng nấu cho bạn (bạn chỉ cần gọi món, nhà hàng lo phần còn lại)

#### 2.4 Guards (Bảo vệ route)
- **Tương tự** middleware trong Next.js
- **Công dụng**: Kiểm tra auth trước khi cho request đi tiếp

```
FE (Next.js middleware)        BE (NestJS Guard)
──────────────────────        ──────────────────
if (!token) {                 canActivate() {
  redirect('/login')            if (!token) throw 401
}                               return true
                              }
```

---

### Phase 3: Prisma ORM (Tuần 5-6)

#### 3.1 ORM là gì?
- **ORM** (Object-Relational Mapping) — viết SQL bằng code thay vì viết SQL thuần
- **Tương tự**: Bạn dùng `fetch()` thay vì `XMLHttpRequest` — cùng chức năng nhưng dễ hơn

```typescript
// Không dùng ORM — viết SQL thuần
const result = await db.query('SELECT * FROM pages WHERE id = $1', [id]);

// Dùng Prisma ORM — viết như code
const page = await prisma.page.findUnique({ where: { id } });
```

#### 3.2 Prisma Schema
```prisma
// schema.prisma — định nghĩa database structure

model Page {
  id        String    @id @default(uuid())  // Primary key, tự generate UUID
  title     String                            // VARCHAR NOT NULL
  slug      String    @unique                 // VARCHAR UNIQUE
  sections  Section[]                         // Quan hệ 1-N với Section
}

model Section {
  id      String @id @default(uuid())
  type    String                             // "hero", "features", "cta"
  content Json                               // JSON blob (flexible)
  order   Int                                // Thứ tự hiển thị
  pageId  String                             // Foreign key → Page
  page    Page   @relation(fields: [pageId], references: [id], onDelete: Cascade)
}
```

**So sánh với TypeScript**:
```typescript
// Prisma schema → TypeScript interface (tự动生成)
interface Page {
  id: string;
  title: string;
  slug: string;
  sections: Section[];
}
```

#### 3.3 Prisma 7 Driver Adapter
- **Prisma 5/6**: Tự kết nối DB bằng built-in query engine
- **Prisma 7**: Dùng driver adapter (bạn tự chọn driver)

```typescript
// Prisma 7 — dùng @prisma/adapter-pg
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });
```

---

### Phase 4: PostgreSQL (Tuần 7-8)

#### 4.1 Tại sao chọn PostgreSQL?
- **PostgreSQL** = PostgreSQL = Postgres (cùng 1 thứ)
- **Ưu điểm**: Miễn phí, mạnh mẽ, hỗ trợ JSON, được dùng rộng rãi
- **So sánh**:
  - SQLite: Nhẹ, file-based, cho dự án nhỏ
  - MySQL: Phổ biến, nhưng kém hơn Postgres về features
  - PostgreSQL: Mạnh nhất trong 3 loại, miễn phí

#### 4.2 Docker cho Database
- **Vấn đề**: Cài PostgreSQL trực tiếp trên máy → phức tạp, khó uninstall
- **Giải pháp**: Chạy PostgreSQL trong Docker container

```
Không có Docker:                    Có Docker:
───────────────                    ──────────
1. Tải PostgreSQL installer        1. docker compose up -d
2. Cài đặt (next, next, finish)    2. Done!
3. Config username/password
4. Start service
5. Hope it works...
```

---

### Phase 5: Auth & Security (Tuần 9-10)

#### 5.1 JWT (JSON Web Token)
- **Là gì**: Chuỗi mã hóa chứa thông tin user
- **Flow**:

```
1. Client gửi username/password → Server
2. Server kiểm tra → tạo JWT token → trả về Client
3. Client lưu token (localStorage/cookie)
4. Mỗi request → Client gửi token trong header
5. Server verify token → cho phép truy cập

Client                    Server
  │                        │
  │── POST /login ────────→│
  │   {user, pass}         │
  │                        │── Kiểm tra DB
  │                        │── Tạo JWT
  │←── { token } ─────────│
  │                        │
  │── GET /pages ─────────→│
  │   Authorization:       │── Verify JWT
  │   Bearer <token>       │── Trả data
  │←── [pages] ───────────│
```

#### 5.2 bcrypt (Hash password)
- **Vấn đề**: Lưu password dạng plain text → nếu bị hack, lộ hết
- **Giải pháp**: Hash password trước khi lưu

```typescript
// Hash password
const hash = await bcrypt.hash('123456', 10);
// Kết quả: '$2b$10$N9qo8uLOickgx2ZMRZoMy...'

// Verify password
const isValid = await bcrypt.compare('123456', hash);
// Kết quả: true
```

---

## Từ vựng BE cần biết

| Thuật ngữ | Nghĩa | Ví dụ trong FE |
|---|---|---|
| **Controller** | Xử lý HTTP request | `page.tsx` |
| **Service** | Business logic | `usePages()` hook |
| **DTO** | Data Transfer Object (validation schema) | Zod schema |
| **Entity** | Model/database table | TypeScript interface |
| **Guard** | Route protection | `middleware.ts` |
| **Middleware** | Code chạy trước/after request | `middleware.ts` |
| **Injectable** | Có thể dùng DI | React Context |
| **Module** | Nhóm related code | Feature folder |
| **Migration** | Version control cho database | Git commits |
| **Seed** | Data mẫu cho dev | Mock data |
| **ORM** | Query DB bằng code | Fetch API |
| **Repository** | Data access layer | API client |

---

## Bài tập thực hành

### Tuần 1-2: Node.js cơ bản
- [ ] Tạo HTTP server trả JSON
- [ ] Đọc/ghi file với `fs` module
- [ ] Tạo simple API (GET, POST) không dùng framework

### Tuần 3-4: NestJS
- [ ] Tạo module CRUD đơn giản (Todo list)
- [ ] Hiểu Dependency Injection
- [ ] Tạo custom decorator

### Tuần 5-6: Prisma
- [ ] Tạo schema cho Todo app
- [ ] CRUD với Prisma Client
- [ ] Viết migration

### Tuần 7-8: PostgreSQL + Docker
- [ ] Chạy PostgreSQL với Docker
- [ ] Viết raw SQL queries
- [ ] Backup/restore database

### Tuần 9-10: Auth
- [ ] Implement JWT login/register
- [ ] Tạo auth guard
- [ ] Hash password với bcrypt

---

## Tài liệu tham khảo

| Tài liệu | Link | Mức độ |
|---|---|---|
| Node.js Docs | https://nodejs.org/docs | Cơ bản |
| NestJS Docs | https://docs.nestjs.com | Trung bình |
| Prisma Docs | https://www.prisma.io/docs | Trung bình |
| PostgreSQL Tutorial | https://www.postgresqltutorial.com | Cơ bản |
| Docker Docs | https://docs.docker.com | Cơ bản |
| JWT Introduction | https://jwt.io/introduction | Cơ bản |
