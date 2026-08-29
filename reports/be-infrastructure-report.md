# Report: BE Infrastructure Implementation

> Ngày: 2026-08-29
> Mục tiêu: Đưa backend từ MVP lên production-ready

---

## Bạn đã học được gì?

Sau khi đọc report này, bạn sẽ hiểu:
1. **Tại sao** cần mỗi thành phần (không chỉ "làm sao")
2. **Cấu trúc thư mục** chuẩn của NestJS
3. **Request lifecycle** — từ client gửi request đến server trả response
4. **Cách một công ty IT** tổ chức backend

---

## Phần 0: Request Lifecycle — Hiểu trước khi code

Trước khi tìm hiểu từng file, bạn cần hiểu một request đi qua những đâu:

```
Client (Browser/Postman)
  │
  ▼
main.ts                    ← Entry point, setup mọi thứ
  │
  ▼
Middleware (helmet)         ← Security headers (trước khi vào route)
  │
  ▼
Guard (JwtAuthGuard)       ← "Bạn có token hợp lệ không?"
  │                          Nếu route có @Public() → skip guard
  ▼
Guard (ThrottlerGuard)     ← "Bạn có gửi quá nhiều request không?"
  │                          Nếu quá 30/phút → trả 429
  ▼
Interceptor (Logging)      ← Ghi log "POST /pages 0ms" (bắt đầu)
  │
  ▼
Pipe (ValidationPipe)      ← Validate DTO: title có rỗng không? slug có hợp lệ không?
  │                          Nếu sai → trả 400 ngay, không vào controller
  ▼
Controller (PagesController) ← Nhận request, gọi service, trả response
  │
  ▼
Service (PagesService)     ← Business logic: query DB, xử lý data
  │
  ▼
PrismaService              ← Chuyển code → SQL query → PostgreSQL
  │
  ▼
Response quay ngược lên:
  │
  ▼
Interceptor (Response)     ← Wrap thành { success: true, data: ..., timestamp: ... }
  │
  ▼
Exception Filter (Prisma)  ← Nếu có lỗi Prisma → map sang HTTP status chuẩn
  │                          Nếu không có lỗi → pass qua
  ▼
Client nhận response
```

**Tại sao hiểu lifecycle quan trọng?** Vì khi debug, bạn biết phải check ở đâu:
- Response sai format? → Check Response Interceptor
- Lỗi 500 mà không rõ? → Check Exception Filter
- Validate không chạy? → Check Pipe trong main.ts
- Auth không hoạt động? → Check Guard + Decorator

---

## Phần 1: Cấu trúc thư mục mới

```
src/
├── main.ts                          ← Entry point (nhà điều phối)
├── app.module.ts                    ← Root module (sơ đồ tổ chức)
├── app.controller.ts                ← Root controller (route /)
├── app.service.ts                   ← Root service
│
├── common/                          ← Code dùng chung (KHÔNG thuộc module nào)
│   ├── filters/
│   │   └── prisma-exception.filter.ts   ← Bắt lỗi Prisma → HTTP response
│   └── interceptors/
│       ├── response.interceptor.ts      ← Wrap response format
│       └── logging.interceptor.ts       ← Ghi log request
│
├── config/
│   └── env.validation.ts            ← Validate biến môi trường khi startup
│
├── prisma/                          ← Database layer
│   ├── prisma.module.ts
│   └── prisma.service.ts
│
├── auth/                            ← Authentication
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── jwt-auth.guard.ts
│   ├── jwt.strategy.ts
│   ├── public.decorator.ts
│   └── dto/
│       ├── login.dto.ts
│       └── register.dto.ts          ← MỚI: Validate username/password
│
├── pages/                           ← Pages CRUD
│   ├── pages.module.ts
│   ├── pages.controller.ts
│   ├── pages.service.ts
│   └── dto/
│       ├── create-page.dto.ts
│       └── update-page.dto.ts
│
└── sections/                        ← Sections CRUD
    ├── sections.module.ts
    ├── sections.controller.ts
    ├── sections.service.ts
    └── dto/
        ├── create-section.dto.ts
        └── update-section.dto.ts
```

**Quy tắc tổ chức:**
- `common/` — code dùng chung, không thuộc feature nào
- `config/` — cấu hình app
- Mỗi feature có module riêng (auth, pages, sections)
- DTOs nằm trong module của nó

---

## Phần 2: Chi tiết từng file đã tạo/sửa

### 2.1 Exception Filter — `src/common/filters/prisma-exception.filter.ts`

**TẠI SAO cần:**
Khi bạn insert trùng slug vào database, Prisma throw lỗi `P2002`. Nếu không có filter:
- Client thấy lỗi 500 Internal Server Error
- Lỗi có thể chứa thông tin nhạy cảm (table name, column name, stack trace)

Với filter:
- Client thấy lỗi 409 Conflict với message "Dữ liệu đã tồn tại (trùng slug hoặc username)"
- Hacker không thấy thông tin database

**CÁCH HOẠT ĐỘNG:**
```typescript
@Catch()  // Bắt TẤT CẢ lỗi (không chỉ Prisma)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // 1. Nếu là Prisma error → map sang HTTP status
    // 2. Nếu là HttpException (NotFoundException, UnauthorizedException) → giữ nguyên
    // 3. Nếu là lỗi unknown → trả 500, KHÔNG lộ stack trace
  }
}
```

**Các Prisma error codes quan trọng:**
| Code | Khi nào xảy ra | HTTP Status |
|------|----------------|-------------|
| P2002 | Trùng unique constraint (slug, username) | 409 Conflict |
| P2025 | Update/xóa record không tồn tại | 404 Not Found |
| P2003 | Foreign key không hợp lệ | 400 Bad Request |

**Cách register trong main.ts:**
```typescript
app.useGlobalFilters(new PrismaExceptionFilter());
// → Áp dụng cho TẤT CẢ routes
```

---

### 2.2 Response Interceptor — `src/common/interceptors/response.interceptor.ts`

**TẠI SAO cần:**
Hiện tại controller trả raw data: `{ id: "123", title: "Test" }`. Frontend không biết:
- Request có thành công không?
- Timestamp để cache/retry?

Với interceptor, TẤT CẢ response đều có format thống nhất:
```json
{
  "success": true,
  "data": { "id": "123", "title": "Test" },
  "timestamp": "2026-08-29T12:00:00.000Z"
}
```

**CÁCH HOẠT ĐỘNG:**
```typescript
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,           // ← Data từ controller
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
```

**Lưu ý:** Error responses KHÔNG đi qua interceptor này, mà đi qua Exception Filter. Nên error format khác success format:
- Success: `{ success: true, data: ..., timestamp: ... }`
- Error: `{ success: false, statusCode: 404, message: "...", timestamp: ..., path: ... }`

---

### 2.3 Logging Interceptor — `src/common/interceptors/logging.interceptor.ts`

**TẠI SAO cần:**
Khi có bug, bạn cần biết:
- Request nào gây lỗi?
- Request nào chậm (chậm = có thể bị attack)?

Log format: `POST /pages 42ms` — method, URL, thời gian xử lý.

**CÁCH HOẠT ĐỘNG:**
```typescript
intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
  const request = context.switchToHttp().getRequest();
  const { method, url } = request;
  const now = Date.now();  // Ghi thời điểm bắt đầu

  return next.handle().pipe(
    tap(() => {
      const elapsed = Date.now() - now;  // Tính thời gian xử lý
      this.logger.log(`${method} ${url} ${elapsed}ms`);
    }),
  );
}
```

**Thứ tự chạy:** Logging interceptor chạy TRƯỚC response interceptor (vì đăng ký trước trong main.ts).

---

### 2.4 RegisterDto — `src/auth/dto/register.dto.ts`

**TẠI SAO cần:**
Hiện tại `/auth/register` dùng inline type `{ username: string; password: string }`. Không có validation:
- Username 1 ký tự? → OK (bad)
- Password "1"? → OK (very bad)
- Username 10MB? → Server crash (very very bad)

Với DTO:
```typescript
@MinLength(3)   // Username tối thiểu 3 ký tự
@MaxLength(50)  // Username tối đa 50 ký tự
@MinLength(8)   // Password tối thiểu 8 ký tự
@MaxLength(100) // Password tối đa 100 ký tự
```

**CÁCH HOẠT ĐỘNG:**
1. Client gửi `POST /auth/register { username: "ab", password: "123" }`
2. ValidationPipe (trong main.ts) chạy class-validator
3. Username "ab" → fail @MinLength(3) → trả 400 ngay
4. Controller/service KHÔNG BAO GIỜ được gọi

---

### 2.5 Environment Validation — `src/config/env.validation.ts`

**TẠI SAO cần:**
Nếu thiếu `DATABASE_URL`:
- App crash với lỗi Prisma khó hiểu: "Can't reach database server at localhost:5432"
- Bạn mất 30 phút mới phát hiện do thiếu env var

Nếu thiếu `JWT_SECRET`:
- Code cũ dùng fallback `'default-secret'`
- Hacker biết secret → fake token → đăng nhập với quyền admin

Với validation:
- Thiếu env → app crash NGAY khi startup với message rõ ràng
- Không có fallback insecure

---

### 2.6 Helmnet — Security Headers

**TẠI SAO cần:**
Browser có các lỗ hổng security:
- Clickjacking: attacker nhúng site bạn vào iframe → lừa user click
- XSS: attacker inject script vào page
- MIME sniffing: browser nhầm file type → execute code

Helmet set các HTTP headers bảo vệ:
```
X-Content-Type-Options: nosniff      ← Không sniff file type
X-Frame-Options: DENY                ← Không cho nhúng iframe
X-XSS-Protection: 1                  ← Bật XSS filter
Strict-Transport-Security: ...       ← Force HTTPS
```

---

### 2.7 Rate Limiting — `@nestjs/throttler`

**TẠI SAO cần:**
Nếu không có rate limiting:
- Attacker gửi 10,000 request/giây → server overload → crash
- Brute force password: thử 1 tỷ password/giây

Với rate limiting:
- 30 request/phút cho tất cả endpoints
- 5 request/phút cho auth endpoints (login, register)
- Quá limit → trả 429 Too Many Requests

---

### 2.8 Swagger — API Documentation

**TẠI SAO cần:**
Frontend cần biết:
- API có những endpoint nào?
- Mỗi endpoint nhận/tham số gì?
- Response format ra sao?

Swagger tự动生成 docs từ code. Truy cập: `http://localhost:3000/api/docs`

---

### 2.9 Service Logger

**TẠI SAO cần:**
Khi có bug trong production:
- Không có log → không biết lỗi ở đâu
- Có log → thấy "Creating page: Test" → biết request đã vào service

```typescript
private readonly logger = new Logger(PagesService.name);
// → Log format: [PagesService] Creating page: Test
```

---

## Phần 3: Cách test

Sau khi chạy `npm run start:dev`:

```bash
# 1. Test Swagger
# Mở browser: http://localhost:3000/api/docs

# 2. Test validation (RegisterDto)
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "ab", "password": "123"}'
# → Expect: 400 Bad Request (username too short, password too short)

# 3. Test error handling (Prisma P2002)
curl -X POST http://localhost:3000/pages \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "slug": "san-pham-moi"}'
# → Expect: 409 Conflict (slug đã tồn tại từ seed data)

# 4. Test rate limiting
# Gửi 6 request liên tiếp → request thứ 6 trả 429

# 5. Test response format
curl http://localhost:3000/pages
# → Expect: { "success": true, "data": [...], "timestamp": "..." }
```

---

## Phần 4: Files đã thay đổi

| File | Thay đổi | Lý do |
|------|----------|-------|
| `main.ts` | Thêm helmet, swagger, filters, interceptors, CORS env, PORT env | Setup infrastructure |
| `app.module.ts` | Thêm env validation, rate limiting | App-level config |
| `auth/auth.controller.ts` | Dùng RegisterDto, thêm rate limit | Security + validation |
| `auth/auth.service.ts` | Không trả password hash, thêm Logger | Security + logging |
| `auth/jwt.strategy.ts` | Loại bỏ fallback 'default-secret' | Security |
| `pages/pages.service.ts` | Thêm Logger | Observability |
| `sections/sections.service.ts` | Thêm Logger | Observability |
| `common/filters/prisma-exception.filter.ts` | MỚI | Error handling |
| `common/interceptors/response.interceptor.ts` | MỚI | Response format |
| `common/interceptors/logging.interceptor.ts` | MỚI | Request logging |
| `auth/dto/register.dto.ts` | MỚI | Validation |
| `config/env.validation.ts` | MỚI | Env validation |

---

## Phần 5: Packages đã cài thêm

| Package | Version | Tác dụng |
|---------|---------|----------|
| `helmet` | latest | Security HTTP headers |
| `@nestjs/throttler` | 6.5.0 | Rate limiting |
| `@nestjs/swagger` | 7.4.2 | API documentation (Swagger) |
| `passport` | latest | Authentication framework (bị mất khi cài packages mới) |
