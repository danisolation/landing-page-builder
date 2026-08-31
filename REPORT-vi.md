# Landing Page Builder — Báo cáo Kỹ thuật

> Báo cáo dự án monorepo full-stack. Bao gồm kiến trúc, chi tiết triển khai, các quyết định thiết kế quan trọng, và thực hành kỹ thuật trên toàn bộ codebase.

---

## Mục lục

1. [Tổng quan Dự án](#1-tổng-quan-dự-án)
2. [Stack Công nghệ](#2-stack-công-nghệ)
3. [Kiến trúc](#3-kiến-trúc)
4. [Backend (NestJS)](#4-backend-nestjs)
5. [Frontend (Next.js)](#5-frontend-nextjs)
6. [Thiết kế Database](#6-thiết-kế-database)
7. [Xác thực & Phân quyền](#7-xác-thực--phân-quyền)
8. [Thiết kế API](#8-thiết-kế-api)
9. [Hệ thống Section](#9-hệ-thống-section)
10. [Đa ngôn ngữ (i18n)](#10-đa-ngôn ngữ-i18n)
11. [Tối ưu Hiệu suất](#11-tối-ưu-hiệu-suất)
12. [Chiến lược Testing](#12-chiến-lược-testing)
13. [Pipeline CI/CD](#13-pipeline-cicd)
14. [Triển khai (Deployment)](#14-triển-khai-deployment)
15. [Bảo mật](#15-bảo-mật)
16. [Các Quyết định Thiết kế Quan trọng](#16-các-quyết-định-thiết-kế-quan-trọng)

---

## 1. Tổng quan Dự án

**Landing Page Builder** là ứng dụng full-stack cho phép quản trị viên tạo, quản lý và xuất bản các landing page với nhiều loại section khác nhau. Khách truy cập công khai có thể xem các trang đã xuất bản với hiệu ứng cuộn mượt而.

### Tính năng Cốt lõi

- **Dashboard Quản trị** — Quản lý trang với tìm kiếm, lọc, sắp xếp, thống kê
- **Trình chỉnh sửa Section** — 5 loại section (hero, features, CTA, stats, testimonials) với trình chỉnh sửa trực quan
- **Kéo & Thả** — Sắp xếp lại các section bằng kéo thả
- **Hệ thống Xem trước** — Xem trước từng section hoặc toàn bộ trang trước khi xuất bản
- **Trang Công khai** — Landing page render phía server với hiệu ứng cuộn
- **Đa ngôn ngữ** — Hỗ trợ tiếng Việt và tiếng Anh
- **Chế độ Dark** — Theme do người dùng chọn

---

## 2. Stack Công nghệ

| Tầng | Công nghệ | Phiên bản | Mục đích |
|------|----------|-----------|----------|
| **Frontend** | Next.js (App Router) | 16.3.2 | SSR/ISR, routing, React Server Components |
| **UI Library** | shadcn/ui (base-nova) | ^4.19.0 | UI primitives accessible, composable |
| **Data Fetching** | TanStack React Query | ^5.102.3 | Quản lý state server, caching |
| **i18n** | next-intl | ^4.13.7 | Đa ngôn ngữ (vi/en) |
| **Forms** | React Hook Form + Zod | ^7.x + ^3.x | Xử lý form + validation schema |
| **Drag & Drop** | @atlaskit/pragmatic-drag-and-drop | ^3.0.0 | Kéo thả accessible |
| **Backend** | NestJS | ^11.0.1 | Framework NodeJS doanh nghiệp |
| **ORM** | Prisma 7 (driver adapter) | ^7.9.1 | Truy cập database type-safe |
| **Database** | PostgreSQL | 16 | Database quan hệ |
| **Auth** | Passport + JWT + bcrypt | — | Xác thực dựa trên token |
| **Container** | Docker Compose | — | Setup PostgreSQL cục bộ |
| **Testing** | Jest + Vitest + Playwright | — | Unit, integration, và E2E tests |
| **CI/CD** | GitHub Actions | — | Tự động testing và build |
| **Deployment** | Vercel (FE) + Render (BE) | — | Hosting production |

---

## 3. Kiến trúc

### Cấu trúc Monorepo

```
landing-page-builder/
├── landing-page-fe/          # Frontend (Next.js 16)
│   ├── src/
│   │   ├── app/              # Các trang App Router
│   │   ├── components/       # Các component UI
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # API client, tiện ích
│   │   ├── messages/         # Bản dịch i18n (vi.json, en.json)
│   │   └── providers/        # React Query provider
│   └── e2e/                  # Playwright tests
│
├── landing-page-be/          # Backend (NestJS)
│   ├── src/
│   │   ├── auth/             # Module xác thực
│   │   ├── pages/            # Module CRUD Pages
│   │   ├── sections/         # Module CRUD Sections
│   │   ├── health/           # Endpoint health check
│   │   ├── prisma/           # Database service
│   │   └── common/           # Filters, interceptors
│   ├── prisma/               # Schema, migrations, seed
│   └── test/                 # E2E tests
│
├── .github/workflows/ci.yml  # GitHub Actions CI
├── vercel.json               # Cấu hình deploy Vercel
└── CLAUDE.md                 # Hướng dẫn AI assistant
```

### vòng đời Request

```
Request → Helmet (security headers)
        → Kiểm tra CORS
        → ValidationPipe (validate DTO)
        → ThrottlerGuard (rate limiting: 30 req/phút)
        → JwtAuthGuard (xác minh token, bỏ qua nếu @Public)
        → Controller → Service → Prisma → PostgreSQL
        → ResponseInterceptor (đóng gói trong { success, data, timestamp })
        → PrismaExceptionFilter (đổi lỗi Prisma sang HTTP)
```

### Các quyết định Kiến trúc Quan trọng

| Quyết định | Lý do |
|-----------|-------|
| **Không chia sẻ types giữa FE/BE** | Mỗi bên phát triển độc lập, giảm coupling |
| **JSON không schema cho nội dung section** | Thêm loại section mới = không thay đổi database |
| **Global auth guard với @Public() opt-out** | Bảo mật mặc định — mọi route đều được bảo vệ trừ khi đánh dấu công khai |
| **Response envelope** | Định dạng response API thống nhất: `{ success, data, timestamp }` |
| **ISR cho trang công khai** | Cân bằng giữa nội dung mới nhất (revalidate 60s) và hiệu suất |

---

## 4. Backend (NestJS)

### Cấu trúc Module

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate }),  // Validate env vars
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 30 }]), // Rate limiting
    PrismaModule,      // Database (global)
    PagesModule,       // CRUD Pages
    SectionsModule,    // CRUD Sections (nested dưới pages)
    AuthModule,        // Xác thực JWT
    HealthModule,      // Endpoint health check
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },    // Auth global
    { provide: APP_GUARD, useClass: ThrottlerGuard },  // Rate limit global
  ],
})
export class AppModule {}
```

### Quá trình Bootstrap (`main.ts`)

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());                          // Security headers
  app.enableCors({ origin: FRONTEND_URL });   // CORS
  app.useGlobalPipes(new ValidationPipe({     // Validate DTO
    whitelist: true,           // Loại bỏ thuộc tính không xác định
    forbidNonWhitelisted: true, // Từ chối thuộc tính không xác định
    transform: true,           // Tự động chuyển đổi payload thành DTO instance
  }));
  app.useGlobalFilters(new PrismaExceptionFilter());  // Xử lý lỗi
  app.useGlobalInterceptors(
    new LoggingInterceptor(),   // Ghi log request
    new ResponseInterceptor(),  // Đóng gói response
  );

  // Swagger tại /api/docs
  SwaggerModule.setup('api/docs', app, document);

  app.enableShutdownHooks();  // Graceful shutdown
  await app.listen(PORT);
}
```

### Validate Environment Variables

Sử dụng decorators `class-validator` để validate env vars khi khởi động:

```typescript
class EnvironmentVariables {
  @IsOptional() @IsEnum(['development', 'production', 'test'])
  NODE_ENV?: string;

  @IsString() DATABASE_URL!: string;
  @IsString() JWT_SECRET!: string;
}
```

**Mẫu fail-fast**: App crash ngay lập tức nếu thiếu env vars bắt buộc — không có lỗi âm thầm trong production.

### Health Check

```typescript
@Public()
@Get()
@HealthCheck()
check() {
  return this.health.check([
    () => this.prismaHealth.pingCheck('database', this.prisma),
  ]);
}
// GET /health → { status: "ok", details: { database: { status: "up" } } }
```

Sử dụng `@nestjs/terminus` để xác minh kết nối PostgreSQL. Endpoint công khai (không cần auth) — được sử dụng bởi load balancer và monitoring.

### Xử lý Lỗi

**PrismaExceptionFilter** ánh xạ mã lỗi Prisma sang HTTP response thân thiện:

| Mã Prisma | HTTP Status | Thông báo |
|-----------|-------------|-----------|
| P2000 | 400 Bad Request | Dữ liệu quá dài cho trường này |
| P2001 | 404 Not Found | Không tìm thấy bản ghi |
| P2002 | 409 Conflict | Bản ghi đã tồn tại (trùng slug hoặc username) |
| P2003 | 400 Bad Request | Tham chiếu khóa ngoại không hợp lệ |
| P2014 | 400 Bad Request | Bắt buộc phải có liên kết |
| P2025 | 404 Not Found | Không tìm thấy bản ghi để cập nhật/xóa |

Lỗi không xác định trả về `500 Internal Server Error` mà không lộ stack trace.

### Graceful Shutdown

```typescript
app.enableShutdownHooks();
process.on('SIGTERM', () => logger.warn('SIGTERM received — shutting down gracefully'));
process.on('SIGINT', () => logger.warn('SIGINT received — shutting down gracefully'));
```

Đảm bảo các request đang xử lý hoàn thành và kết nối database được đóng một cách sạch sẽ.

### Logging

Ghi log có cấu trúc với `Logger` tích hợp sẵn của NestJS:

| Level | Sử dụng |
|-------|---------|
| `debug` | Thao tác CRUD, trạng thái nội bộ |
| `log` | Hoàn thành request, thao tác thành công |
| `warn` | Đăng nhập thất bại, bản ghi không tìm thấy |
| `error` | Ngoại lệ chưa xử lý |

Mỗi HTTP request đều được ghi log với method, URL, và thời gian thực thi thông qua `LoggingInterceptor`.

---

## 5. Frontend (Next.js)

### Kiến trúc Routing

```
[locale]/                    # Wrapper locale (vi/en)
├── login/                   # Trang đăng nhập (Client Component)
├── dashboard/               # Dashboard với thống kê (Client Component)
├── pages/                   # Danh sách trang (Client Component)
│   ├── new/                 # Form tạo trang
│   └── [id]/
│       ├── edit/            # Sửa trang + danh sách section
│       └── sections/
│           ├── new/         # Tạo section
│           └── [sectionId]/edit/  # Sửa section
└── [slug]/                  # Trang landing PAGE CÔNG KHAI (Server Component)
```

### Trang Công khai — Mẫu Server Component

```typescript
// [slug]/page.tsx — Server Component
export default async function PublicPage({ params }) {
  const { slug } = await params;
  const page = await getPublicPageBySlug(slug);  // Fetch phía server
  if (!page) notFound();
  return <PublicPageClient page={page} />;  // Truyền data cho client
}
```

**Tại sao điều này quan trọng:**
- Data fetch trên server → không có waterfall phía client
- ISR với revalidate 60 giây → nội dung mới nhất mà không có overhead SSR
- HTML render trên server → thân thiện SEO
- Client component chỉ xử lý tương tác (bật/tắt dark mode, hiệu ứng cuộn)

### Luồng Dữ liệu phía Client

```
Server Component (page.tsx)
  → fetch data qua server-api.ts (không auth, ISR)
  → truyền data như props cho PublicPageClient (client component)
  → render các section với hiệu ứng IntersectionObserver
```

Cho các trang admin:
```
Client Component → TanStack Query → api.ts (fetchAPI với JWT) → Backend
```

### API Client (`lib/api.ts`)

```typescript
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  if (!res.ok) throw new Error((await res.json()).message);

  const json: ApiResponse<T> = await res.json();
  return json.data;  // Giải nén response envelope
}
```

- Tự động inject JWT token từ localStorage
- Giải nén envelope `{ success, data, timestamp }`
- Throw lỗi khi response không phải 2xx với thông báo lỗi từ server

### Server-Side API (`lib/server-api.ts`)

```typescript
export async function getPublicPageBySlug(slug: string): Promise<Page | null> {
  const res = await fetch(`${API_URL}/pages/slug/${slug}`, {
    next: { revalidate: 60 },  // ISR: revalidate mỗi 60s
  });
  if (!res.ok) return null;
  return (await res.json()).data;
}
```

- Không có token auth (endpoint công khai)
- Sử dụng cache `fetch` của Next.js với `revalidate: 60`
- Xử lý lỗi nhẹ nhàng → trả về null → kích hoạt `notFound()`

### Middleware

Middleware xử lý ba mối quan tâm:

1. **Routing locale** — Chuyển hướng `/path` → `/vi/path` (locale mặc định)
2. **Auth guard** — Chuyển hướng người dùng chưa xác thực đến `/login` cho các route được bảo vệ
3. **Phân loại route** — Route công khai (login, [slug]) vs route được bảo vệ (dashboard, pages)

```typescript
// Logic đơn giản hóa
if (!token && !isPublicRoute) → chuyển hướng đến /login
if (token && isLoginPage) → chuyển hướng đến /dashboard
if (isRootPage) → chuyển hướng đến /dashboard hoặc /login
```

### Quản lý State

**TanStack Query** cho server state:

```typescript
// Query key factory
export const pageKeys = {
  all: ['pages'] as const,
  detail: (id: string) => ['pages', id] as const,
};

// Hook với cache invalidation
const createMutation = useMutation({
  mutationFn: createPage,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: pageKeys.all });
  },
});
```

- Stale time 60 giây (khớp với ISR)
- Không refetch khi window focus (chỉ admin, môi trường kiểm soát)
- Toast notifications chỉ ở call-site (tránh trùng lặp với TanStack)

---

## 6. Thiết kế Database

### Schema

```prisma
model Page {
  id          String   @id @default(uuid())
  title       String
  slug        String   @unique
  description String?
  isPublished Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  sections    Section[]
}

model Section {
  id        String @id @default(uuid())
  type      String           // "hero" | "features" | "cta" | "stats" | "testimonials"
  content   Json             // JSON không schema — FE định nghĩa kiểu
  order     Int              // Thứ tự hiển thị
  pageId    String
  page      Page   @relation(fields: [pageId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Admin {
  id        String   @id @default(uuid())
  username  String   @unique
  password  String   // bcrypt hashed
  createdAt DateTime @default(now())
}
```

### Các quyết định Thiết kế Quan trọng

| Quyết định | Lý do |
|-----------|-------|
| **UUID primary keys** | Không đoán được ID tuần tự, an toàn cho hệ thống phân tán |
| **JSON content cho sections** | Thêm loại section mới = không cần migration |
| **Trường `order` trên sections** | Sắp xếp rõ ràng, không phụ thuộc vào thứ tự tạo |
| **Cascade delete** | Xóa page sẽ tự động xóa tất cả sections của nó |
| **Cờ `isPublished`** | Quy trình draft/xuất bản không cần bảng riêng |

### Prisma 7 Driver Adapter

```typescript
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    super({ adapter });
  }
}
```

Sử dụng `@prisma/adapter-pg` thay vì query engine truyền thống — kết nối PostgreSQL trực tiếp qua driver `pg` để hiệu suất tốt hơn và bundle nhỏ hơn.

---

## 7. Xác thực & Phân quyền

### Luồng

```
1. POST /auth/login { username, password }
2. Service xác minh thông tin (bcrypt.compare)
3. Trả về JWT token { sub: adminId, username }
4. Client lưu token trong localStorage + cookie
5. Các request tiếp theo gồm Authorization: Bearer <token>
6. JwtStrategy xác minh token và gắn user vào request
```

### JWT Strategy

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload) {
    return { id: payload.sub, username: payload.username };
  }
}
```

### Global Auth Guard

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }
}
```

Đăng ký làm `APP_GUARD` — mọi route đều được bảo vệ theo mặc định. Controllers opt-out với decorator `@Public()`.

### Rate Limiting

| Endpoint | Giới hạn | TTL |
|----------|---------|-----|
| Toàn cục | 30 req/phút | 60s |
| Auth (login/register) | 5 req/phút | 60s |

---

## 8. Thiết kế API

### Response Envelope

Mọi response đều được đóng gói bởi `ResponseInterceptor`:

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-08-31T10:00:00.000Z"
}
```

Error response:

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Không tìm thấy page với id \"abc\"",
  "timestamp": "2026-08-31T10:00:00.000Z",
  "path": "/pages/abc"
}
```

### Các Endpoints

| Method | Path | Auth | Mô tả |
|--------|------|:----:|-------|
| POST | `/auth/register` | ❌ | Tạo tài khoản admin |
| POST | `/auth/login` | ❌ | Đăng nhập → JWT token |
| GET | `/auth/profile` | ✅ | Lấy thông tin admin hiện tại |
| POST | `/pages` | ✅ | Tạo page |
| GET | `/pages` | ✅ | Liệt kê tất cả pages với sections |
| GET | `/pages/:id` | ✅ | Lấy page theo ID |
| GET | `/pages/slug/:slug` | ❌ | Lấy page theo slug (công khai) |
| PATCH | `/pages/:id` | ✅ | Cập nhật page |
| DELETE | `/pages/:id` | ✅ | Xóa page (cascade) |
| POST | `/pages/:pageId/sections` | ✅ | Tạo section |
| GET | `/pages/:pageId/sections` | ✅ | Liệt kê sections (sắp xếp) |
| GET | `/pages/:pageId/sections/:id` | ✅ | Lấy section |
| PATCH | `/pages/:pageId/sections/:id` | ✅ | Cập nhật section |
| DELETE | `/pages/:pageId/sections/:id` | ✅ | Xóa section |
| GET | `/health` | ❌ | Health check với DB ping |

### Mẫu Nested Resource

Sections được lồng dưới pages:

```
/pages/:pageId/sections
```

Điều này thực thi mối quan hệ ở cấp API — bạn không thể tạo section mà không có pageId hợp lệ.

---

## 9. Hệ thống Section

### Kiến trúc

```
section-constants.ts  →  Registry tất cả các loại section
  ├── defaultContent    →  Nội dung mặc định trống cho mỗi loại
  ├── sectionEditors    →  Component editor cho mỗi loại
  └── sectionTypes      →  Mảng các chuỗi loại hợp lệ
```

### Các loại Section

| Loại | Cấu trúc Nội dung |
|------|-------------------|
| `hero` | heading, subheading, buttonText, buttonLink, secondaryButtonText, secondaryButtonLink |
| `features` | subtitle, title, description, items[](icon, name, description) |
| `cta` | heading, description, buttonText, buttonLink, secondaryButtonText, secondaryButtonLink |
| `stats` | title, items[](value, suffix, label) |
| `testimonials` | subtitle, title, description, items[](quote, name, role, avatar) |

### Nội dung Không Schema

Nội dung section được lưu dưới dạng JSON trong database:

```json
{
  "heading": "Chào mừng đến với Nền tảng của Chúng tôi",
  "subheading": "Xây dựng landing page tuyệt vời",
  "buttonText": "Bắt đầu ngay",
  "buttonLink": "#pricing"
}
```

**Tại sao JSON?** Thêm loại section mới (ví dụ: pricing, FAQ) yêu cầu:
1. Tạo component editor trong FE
2. Tạo component renderer trong FE
3. Đăng ký trong `section-constants.ts`

**Không thay đổi database.** BE lưu bất kỳ JSON nào mà FE gửi.

### Sắp xếp lại bằng Kéo & Thả

Sử dụng `@atlaskit/pragmatic-drag-and-drop`:

```typescript
// SectionList.tsx
useEffect(() => {
  return monitorForElements({
    canMonitor: ({ source }) => source.data?.type === 'section-card',
    onDrop: ({ source, location }) => {
      const newOrder = reorder({ list: current, startIndex, finishIndex });
      onReorder(newOrder.map(s => s.id));  // Lưu xuống backend
    },
  });
}, [onReorder]);
```

- Global drag monitor đăng ký một lần
- Mẫu callback dựa trên Ref (tránh stale closures)
- Drop indicators hiển thị vị trí thả hợp lệ

---

## 10. Đa ngôn ngữ (i18n)

### Thiết lập

- **Thư viện**: `next-intl`
- **Locales**: `vi` (mặc định), `en`
- **File bản dịch**: `src/messages/vi.json`, `src/messages/en.json`

### Routing

```
/vi/dashboard    → Dashboard tiếng Việt
/en/dashboard    → Dashboard tiếng Anh
/                → Chuyển hướng đến /vi (locale mặc định)
```

### Sử dụng trong Components

```typescript
const t = useTranslations('pages');
<h1>{t('title')}</h1>           // "Pages" hoặc "Trang"
<p>{t('noPagesDesc')}</p>       // Bản dịch theo ngữ cảnh
```

### Cấu trúc Namespace

```json
{
  "common": { "loading": "...", "save": "...", "cancel": "..." },
  "nav": { "dashboard": "...", "pages": "..." },
  "pages": { "title": "...", "createPage": "...", "deleteSuccess": "..." },
  "login": { "title": "...", "loginFailed": "..." },
  "sectionEditor": { "heading": "...", "subheading": "..." },
  "error": { "title": "...", "message": "...", "retry": "..." }
}
```

---

## 11. Tối ưu Hiệu suất

### Trang Công khai (SSR + ISR)

```typescript
// Fetch phía server với ISR
const res = await fetch(`${API_URL}/pages/slug/${slug}`, {
  next: { revalidate: 60 },  // Revalidate mỗi 60 giây
});
```

- HTML render trên server → FCP nhanh
- Cache trong 60 giây → giảm tải server
- Revalidate nền → nội dung cũ được phục vụ trong khi refresh

### Không dùng framer-motion trên Trang Công khai

```typescript
// AnimatedSection sử dụng CSS + IntersectionObserver, KHÔNG dùng framer-motion
export default function AnimatedSection({ children }) {
  const { ref, isInView } = useInView();
  return (
    <div ref={ref} className={`transition-all duration-700 ${
      isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`}>
      {children}
    </div>
  );
}
```

**Tại sao?** framer-motion thêm ~30KB gzipped vào bundle. CSS transitions + IntersectionObserver đạt hiệu ứng hình ảnh tương đương với zero JS overhead trên trang công khai.

### Lazy Loading

```typescript
const SectionPreviewModal = lazy(() => import('./SectionPreviewModal'));
const FullPagePreview = lazy(() => import('./FullPagePreview'));

// Trong JSX
<Suspense fallback={<Skeleton />}>
  <SectionPreviewModal />
</Suspense>
```

Các modal preview được tải theo yêu cầu → bundle nhỏ hơn.

### Hiệu suất Cuộn

```typescript
// useRef cho theo dõi cuộn — KHÔNG dùng useState
const lastScrollYRef = useRef(0);

useEffect(() => {
  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    setHidden(currentScrollY > lastScrollYRef.current && currentScrollY > 200);
    lastScrollYRef.current = currentScrollY;
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```

**Tại sao useRef?** `useState` cho `lastScrollY` sẽ gây re-render trên mỗi sự kiện cuộn. `useRef` cập nhật giá trị mà không kích hoạt render.

---

## 12. Chiến lược Testing

### Kim tự tháp Test

```
         ┌─────────┐
         │  E2E    │  Playwright (FE) + Supertest (BE)
         │ 3 tests │  Luồng API đầy đủ với DB thật
        ┌┴─────────┴┐
        │ Integration│  (dự kiến)
        │            │
       ┌┴────────────┴┐
       │   Unit Tests  │  Jest (BE) + Vitest (FE)
       │   46 tests    │  Dependencies được mock
       └──────────────┘
```

### BE Unit Tests (Jest)

**26 tests** trong 4 suite:

| Suite | Tests | Kiểm tra gì |
|-------|-------|------------|
| `auth.service.spec.ts` | 6 | Đăng ký, đăng nhập, bcrypt, JWT, profile |
| `pages.service.spec.ts` | 10 | Thao tác CRUD, lỗi not-found |
| `sections.service.spec.ts` | 10 | Thao tác CRUD, validate page |
| `app.controller.spec.ts` | 1 | Endpoint Hello World |

**Mẫu**: Mock PrismaService, kiểm tra business logic cô lập.

```typescript
const module = await Test.createTestingModule({
  providers: [
    AuthService,
    { provide: PrismaService, useValue: prisma },  // Mock
    { provide: JwtService, useValue: jwt },          // Mock
  ],
}).compile();
```

### BE E2E Tests (Supertest)

**3 file test** với PostgreSQL thật:

| File | Tests | Luồng |
|------|-------|-------|
| `auth.e2e-spec.ts` | 8 | Đăng ký → Đăng nhập → Profile |
| `pages.e2e-spec.ts` | 8 | Đăng nhập → Tạo → Đọc → Sửa → Công khai → Xóa |
| `sections.e2e-spec.ts` | 6 | Đăng nhập → Tạo page → CRUD sections → Dọn dẹp |

**Điểm quan trọng**: Sử dụng `test-app.helper.ts` chung để override ThrottlerGuard trong tests.

```typescript
export async function createTestApp(): Promise<INestApplication> {
  const module = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(APP_GUARD)
    .useClass(NoThrottleGuard)  // Tắt rate limiting trong tests
    .compile();
  // ... áp dụng pipes, filters, interceptors
}
```

### FE Unit Tests (Vitest)

**20 tests** trong 3 suite:

| Suite | Tests | Kiểm tra gì |
|-------|-------|------------|
| `api.test.ts` | 14 | API client: auth, pages, sections, xử lý lỗi |
| `section-constants.test.ts` | 4 | Registry loại section, cấu trúc content mặc định |
| `useInView.test.ts` | 2 | Xác minh export hook |

**Mẫu**: Mock `fetch`, kiểm tra các hàm API client.

```typescript
vi.stubGlobal('fetch', mockFetch);
mockFetch.mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ success: true, data: [...], timestamp: '' }),
});
const result = await getPages();
expect(result).toEqual([...]);
```

---

## 13. Pipeline CI/CD

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
Kích hoạt: push vào main, PR vào main

Các Job:
  1. Lint & Build
     ├── Cài deps BE → prisma generate → nest build
     └── Cài deps FE → eslint → next build

  2. Backend Unit Tests (needs: lint-and-build)
     └── jest --coverage

  3. Frontend Unit Tests (needs: lint-and-build)
     └── vitest run

  4. Backend E2E Tests (needs: lint-and-build)
     ├── PostgreSQL service container
     ├── prisma migrate deploy
     ├── prisma db seed
     └── jest --config ./test/jest-e2e.json
```

### Luồng Pipeline

```
Push vào main
  → lint-and-build (song song: BE build + FE lint + FE build)
    → test-backend (song song với test-frontend và test-e2e)
    → test-frontend
    → test-e2e (với PostgreSQL)
```

### Các quyết định CI Quan trọng

| Quyết định | Lý do |
|-----------|-------|
| **Node 24** | Node 20 đã deprecated trên GitHub Actions |
| **`--legacy-peer-deps`** | Xung đột giải quyết dependencies trong monorepo |
| **Prisma generate trước build** | Build NestJS cần Prisma client types đã generate |
| **E2E job riêng** | Cần PostgreSQL service container, không thể chia sẻ với unit tests |
| **Không có FE Playwright trong CI** | Cần cả 2 servers FE + BE chạy đồng thời — setup phức tạp |

---

## 14. Triển khai (Deployment)

### Frontend — Vercel

```json
// vercel.json
{
  "buildCommand": "cd landing-page-fe && npm install && npm run build",
  "outputDirectory": "landing-page-fe/.next"
}
```

- **Root `package.json`** với script `vercel-build` để hỗ trợ monorepo
- **`outputDirectory`** trỏ đến `landing-page-fe/.next` (không phải root `.next`)
- Tự động deploy khi push vào `main`
- ISR được xử lý bởi edge network của Vercel

### Backend — Render

```yaml
# render.yaml
services:
  - type: web
    buildCommand: npm install && prisma generate && nest build
    startCommand: prisma migrate deploy && node dist/src/main
    envVars:
      - DATABASE_URL (từ managed PostgreSQL)
      - JWT_SECRET (tự动生成)
      - FRONTEND_URL (domain Vercel)
```

- **Managed PostgreSQL** — Render cung cấp và quản lý database
- **Tự động deploy** khi push vào `main`
- **Free tier** — Đủ cho portfolio/demo

### Phát triển Cục bộ

```bash
# Terminal 1: Database
cd landing-page-be && docker compose up -d

# Terminal 2: Backend
cd landing-page-be && npm run start:dev  # Port 3000

# Terminal 3: Frontend
cd landing-page-fe && npm run dev        # Port 3001
```

---

## 15. Bảo mật

### Các biện pháp

| Tầng | Triển khai |
|------|-----------|
| **Security Headers** | `helmet` — bảo vệ clickjacking, XSS, MIME sniffing |
| **CORS** | Cấu hình qua env var `FRONTEND_URL`, không hardcode origins |
| **Input Validation** | Global `ValidationPipe` với `whitelist: true` (loại bỏ field không xác định) |
| **Rate Limiting** | 30 req/phút toàn cục, 5 req/phút cho auth endpoints |
| **Mã hóa Mật khẩu** | bcrypt với 10 rounds |
| **JWT** | Bearer token trong Authorization header, xác minh trên mỗi request |
| **Error Exposure** | Lỗi không xác định trả về thông báo chung — không lộ stack trace |
| **SQL Injection** | Prisma ORM parameterize tất cả queries |

### Bảo mật Luồng Auth

```
Password → bcrypt.hash(password, 10) → lưu trong DB
Login → bcrypt.compare(password, hash) → JWT ký bằng JWT_SECRET
Request → ExtractJwt.fromAuthHeaderAsBearerToken() → xác minh chữ ký
```

- Mật khẩu không bao giờ được trả về trong API responses
- JWT secret được xác minh khi khởi động (fail-fast nếu thiếu)
- Token lưu cả trong localStorage (client) và cookie (middleware)

---

## 16. Các Quyết định Thiết kế Quan trọng

### 1. JSON Không Schema cho Nội dung Section

**Quyết định**: Lưu nội dung section dưới dạng JSON thay vì các cột có kiểu.

**Đánh đổi**:
- ✅ Thêm loại section mới = zero migrations
- ✅ FE kiểm soát cấu trúc data
- ❌ Không có validate ở cấp database
- ❌ Không query được các field content cụ thể hiệu quả

**Kết luận**: Đúng cho trường hợp sử dụng này. Nội dung section là write-once, read-many, và luôn fetch dưới dạng toàn bộ.

### 2. Không Chia sẻ Types giữa FE và BE

**Quyết định**: Mỗi bên tự định nghĩa TypeScript interfaces riêng.

**Đánh đổi**:
- ✅ Deploy và phát triển độc lập
- ✅ Không có build dependency giữa các bên
- ❌ Có thể xảy ra type drift (ví dụ: FE kỳ vọng field X, BE không trả về)

**Kết luận**: Chấp nhận được cho dự án hai người hoặc một người. Sẽ chuyển sang shared types (ví dụ: `tRPC` hoặc shared package) cho nhóm lớn hơn.

### 3. Global Auth Guard với @Public() Opt-Out

**Quyết định**: Mọi route đều được bảo vệ theo mặc định, opt-out với `@Public()`.

**Thay thế**: Bảo vệ các route riêng lẻ với `@UseGuards(JwtAuthGuard)`.

**Tại sao**: Bảo mật mặc định. Các endpoint mới tự động được bảo vệ. Developers phải chủ động làm endpoint công khai — hành động có chủ đích, không phải bỏ sót vô tình.

### 4. CSS Animation thay vì framer-motion cho Trang Công khai

**Quyết định**: Sử dụng CSS transitions + IntersectionObserver cho hiệu ứng trang công khai.

**Tại sao**: framer-motion thêm ~30KB vào bundle. Trang công khai được xem bởi end users có thể đang dùng kết nối chậm. CSS animations đạt hiệu ứng hình ảnh tương đương với zero JS overhead.

### 5. ISR với Revalidation 60 Giây

**Quyết định**: Sử dụng Incremental Static Regeneration cho trang công khai.

**Tại sao**: Cân bằng giữa:
- Tính mới nhất (nội dung cập nhật trong 60 giây)
- Hiệu suất (phục vụ HTML đã cache, không render server mỗi request)
- Chi phí (giảm database queries trên Vercel)

---

## Tổng kết

| Chỉ số | Giá trị |
|--------|---------|
| **Tổng số source files** | ~80 |
| **BE unit tests** | 26 |
| **FE unit tests** | 20 |
| **BE e2e tests** | 22 (trong 3 files) |
| **API endpoints** | 15 |
| **Loại section** | 5 |
| **Locale i18n** | 2 (vi, en) |
| **CI jobs** | 4 (lint-build, test-backend, test-frontend, test-e2e) |
| **Mục tiêu Deployment** | 2 (Vercel FE, Render BE) |

---

*Báo cáo được tạo cho tài liệu portfolio. Cập nhật lần cuối: Tháng 8, 2026.*
