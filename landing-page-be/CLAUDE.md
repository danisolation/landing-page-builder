# Backend Rules

NestJS 11 + TypeScript (ES2023, nodenext) + Prisma 7 + PostgreSQL 16 + Passport/JWT + bcrypt

---

## ⚠️ Mentor Mode (CRITICAL)

**Không được tự ý chỉnh sửa code BE.** User muốn tự tay viết BE để học.

Khi user hỏi về BE:
1. **Giải thích** khái niệm trước (concept, pattern, why)
2. **Gợi ý** approach phù hợp (viết ở đâu, theo pattern nào)
3. **Cho ví dụ** code ngắn gọn để user hiểu ý tưởng
4. **Để user tự gõ** — KHÔNG dùng Edit/Write tool trên file BE
5. **Review** khi user hoàn thành — check lại và gợi ý fix nếu cần

Trường hợp ngoại lệ — được phép edit BE:
- Fix typo, formatting rõ ràng
- Khi user yêu cầu trực tiếp "fix giúp tôi"
- Update CLAUDE.md, PROGRESS.md, hoặc docs

---

## Prisma 7 — IMPORTANT

This project uses **Prisma 7 driver adapter pattern**. This is different from Prisma 5/6.

```typescript
// ✅ Correct — Prisma 7 with driver adapter
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// ❌ Wrong — this is Prisma 5/6 style, do NOT use
const prisma = new PrismaClient({ datasources: { db: { url } } });
```

- `PrismaService` extends `PrismaClient` and creates `PrismaPg` adapter in constructor
- `prisma.config.ts` loads dotenv and sets schema/migrations/seed paths
- Always use the global `PrismaService` via dependency injection

---

## Module Pattern

Every module follows this structure:

```
src/modules/auth/                    ← Feature-based organization
├── auth.module.ts                   ← Module definition
├── auth.controller.ts               ← Route handlers (thin — delegate to service)
├── auth.service.ts                  ← Business logic (fat — all logic here)
├── dto/
│   ├── login.dto.ts                 ← Input validation (class-validator)
│   └── register.dto.ts
├── guards/
│   └── jwt-auth.guard.ts
├── strategies/
│   └── jwt.strategy.ts
├── decorators/
│   └── public.decorator.ts
└── interceptors/
```

Shared code goes in `src/common/`:
```
src/common/
├── decorators/                      ← Custom decorators (@Public, @CurrentUser)
├── filters/                         ← Exception filters (Prisma, HTTP)
├── interceptors/                    ← Response wrapper, logging
├── pipes/                           ← Custom pipes
├── guards/                          ← Shared guards
└── middleware/                      ← Request logging, request ID
```

---

## Conventions

### Core Principles

- **Thin controllers, fat services** — Controller chỉ handle HTTP, Service xử lý tất cả logic
- **DTOs always** — validate với `class-validator`, document với `@ApiProperty()`
- **Existence checks** — luôn verify record exists trước update/remove, throw 404 nếu không tìm thấy
- **Nested REST routes** — sections dưới pages: `/pages/:pageId/sections`
- **ValidationPipe global** — `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`
- **CORS** — dùng env var, không hardcode
- **Vietnamese comments** — code comments viết bằng tiếng Việt
- **No pagination** — `findAll` trả về tất cả records (thêm skip/take khi cần)
- **No soft delete** — deletes là hard deletes

### File Naming

- `*.module.ts` — Module definition
- `*.controller.ts` — Route handlers
- `*.service.ts` — Business logic
- `*.dto.ts` — Data Transfer Objects (validation)
- `*.entity.ts` — Response DTOs (API response shape)
- `*.guard.ts` — Guards
- `*.strategy.ts` — Passport strategies
- `*.decorator.ts` — Custom decorators
- `*.filter.ts` — Exception filters
- `*.interceptor.ts` — Interceptors
- `*.spec.ts` — Unit tests (alongside source)
- `*.e2e-spec.ts` — E2E tests (in `test/`)

### Import Order

```typescript
// 1. NestJS core
import { Controller, Get, Post, Body, Param } from '@nestjs/common';

// 2. Third-party libs
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

// 3. Internal modules
import { PagesService } from './pages.service';

// 4. DTOs
import { CreatePageDto } from './dto/create-page.dto';

// 5. Guards, decorators
import { Public } from '../auth/decorators/public.decorator';
```

---

## DTO Standards

### Validation Rules

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, Matches, MaxLength, MinLength, IsIn } from 'class-validator';

export class CreatePageDto {
  @ApiProperty({ example: 'Sản phẩm mới', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'san-pham-moi', pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang',
  })
  slug: string;

  @ApiProperty({ required: false, maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

// UpdateDto dùng PartialType — tất cả optional
export class UpdatePageDto extends PartialType(CreatePageDto) {}
```

### Rules

- **CreateDto** — required fields với validation decorators
- **UpdateDto** — `extends PartialType(CreateDto)` — tất cả optional
- **ResponseDto** — định nghĩa shape của API response (không trả raw Prisma entity)
- **Luôn có** `@MaxLength` cho string fields —防止 client gửi 10MB string
- **Luôn có** `@ApiProperty()` cho Swagger documentation
- **Slug format** — `@Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)`
- **Section type** — `@IsIn(['hero', 'features', 'cta', 'stats', 'testimonials'])`
- **Password** — `@MinLength(8)`, `@MaxLength(100)`

### RegisterDto (CRITICAL — currently missing)

```typescript
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

---

## Error Handling Standards

### Global Exception Filter

```typescript
// src/common/filters/prisma-exception.filter.ts
@Catch()
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    // Prisma errors
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const errorMap: Record<string, { status: number; message: string }> = {
        P2000: { status: 400, message: 'Dữ liệu quá dài cho trường này' },
        P2001: { status: 404, message: 'Không tìm thấy bản ghi' },
        P2002: { status: 409, message: 'Dữ liệu đã tồn tại (trùng slug hoặc username)' },
        P2003: { status: 400, message: 'Tham chiếu khóa ngoại không hợp lệ' },
        P2014: { status: 400, message: 'Bắt buộc phải có liên kết' },
        P2025: { status: 404, message: 'Không tìm thấy bản ghi để cập nhật/xóa' },
      };

      const mapped = errorMap[exception.code];
      if (mapped) {
        return response.status(mapped.status).json({
          success: false,
          statusCode: mapped.status,
          message: mapped.message,
          timestamp: new Date().toISOString(),
          path: request.url,
        });
      }
    }

    // HTTP errors (NestJS exceptions)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      return response.status(status).json({
        success: false,
        statusCode: status,
        message: typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }

    // Unknown errors — KHÔNG expose stack trace
    response.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Lỗi hệ thống, vui lòng thử lại sau',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

### Prisma Error Codes

| Code | Meaning | HTTP Status | Message |
|---|---|---|---|
| P2000 | Value too long | 400 | Dữ liệu quá dài |
| P2001 | Record not found (where) | 404 | Không tìm thấy |
| P2002 | Unique constraint | 409 | Dữ liệu đã tồn tại |
| P2003 | Foreign key | 400 | Tham chiếu không hợp lệ |
| P2014 | Required relation | 400 | Bắt buộc phải có liên kết |
| P2025 | Record not found (update/delete) | 404 | Không tìm thấy |

### Service Error Pattern

```typescript
async findOne(id: string) {
  const page = await this.prisma.page.findUnique({ where: { id } });

  if (!page) {
    throw new NotFoundException(`Page with id "${id}" not found`);
  }

  return page;
}
```

---

## Response Format Standards

### Response Interceptor

```typescript
// src/common/interceptors/response.interceptor.ts
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
```

### Register in main.ts

```typescript
app.useGlobalInterceptors(new ResponseInterceptor());
```

### Response Shape

```json
// Success
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-08-29T12:00:00.000Z"
}

// Error (from exception filter)
{
  "success": false,
  "statusCode": 404,
  "message": "Page not found",
  "timestamp": "2026-08-29T12:00:00.000Z",
  "path": "/pages/123"
}
```

---

## Security Standards

### JWT

- **Secret** — LUÔN từ env var, KHÔNG fallback `'default-secret'`. Nếu thiếu → throw error khi startup
- **Token expiry** — 1 ngày (hiện tại), có thể giảm xuống 15 phút khi có refresh token
- **Global guard** — `APP_GUARD` trong `AppModule`
- **@Public() decorator** — bypass auth cho public routes

### CORS

```typescript
// ✅ Dùng env var
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true,
});

// ❌ KHÔNG hardcode
app.enableCors({ origin: 'http://localhost:3001' });
```

### Rate Limiting

```typescript
// app.module.ts
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,   // 1 minute
      limit: 30,    // 30 requests per minute
    }]),
  ],
})

// Auth endpoints — stricter
@Throttle({ default: { limit: 5, ttl: 60000 } })  // 5 attempts per minute
@Post('login')
async login(@Body() dto: LoginDto) { ... }
```

### Security Headers

```bash
npm install helmet
```

```typescript
import helmet from 'helmet';
app.use(helmet());
```

### Input Sanitization

```typescript
// Sanitize HTML content trong section.content
import * as sanitizeHtml from 'sanitize-html';

function sanitizeContent(content: Record<string, any>): Record<string, any> {
  const sanitized = { ...content };
  for (const key of Object.keys(sanitized)) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeHtml(sanitized[key]);
    }
  }
  return sanitized;
}
```

---

## Environment Configuration

### Validation (fail fast on startup)

```typescript
// src/config/env.validation.ts
import { plainToInstance } from 'class-transformer';
import { IsString, IsNumber, IsEnum, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsEnum(['development', 'production', 'test'])
  NODE_ENV: string;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  JWT_SECRET: string;

  @IsNumber()
  PORT: number;
}

export function validate(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n${errors.toString()}`);
  }

  return validated;
}
```

```typescript
// app.module.ts
ConfigModule.forRoot({
  isGlobal: true,
  validate,
})
```

### Typed Config

```typescript
// src/config/app.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
}));
```

---

## Logging Standards

### NestJS Logger

```typescript
import { Logger } from '@nestjs/common';

@Injectable()
export class PagesService {
  private readonly logger = new Logger(PagesService.name);

  async findAll() {
    this.logger.log('Fetching all pages');
    try {
      const pages = await this.prisma.page.findMany();
      this.logger.log(`Found ${pages.length} pages`);
      return pages;
    } catch (error) {
      this.logger.error('Failed to fetch pages', error.stack);
      throw error;
    }
  }
}
```

### Request Logging Interceptor

```typescript
// src/common/interceptors/logging.interceptor.ts
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const elapsed = Date.now() - now;
        this.logger.log(`${method} ${url} ${elapsed}ms`);
      }),
    );
  }
}
```

### Log Levels

| Level | Khi nào dùng |
|---|---|
| `log` | Operations bình thường (requests, completions) |
| `warn` | Deprecations, non-critical issues |
| `error` | Exceptions, failures (luôn include stack trace) |
| `debug` | Dev debugging (xóa trong production) |

---

## API Documentation (Swagger)

### Setup

```typescript
// main.ts
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('Landing Page Builder API')
  .setDescription('API for managing landing pages and sections')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

### Decorators

```typescript
@ApiTags('Pages')
@Controller('pages')
export class PagesController {
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả trang' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  findAll() { ... }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết một trang' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  findOne(@Param('id') id: string) { ... }
}
```

---

## Testing Standards

### Unit Tests

- File: `*.spec.ts` alongside source files
- Mock `PrismaService` với `jest.fn()`
- Test cả success và error paths
- Pattern: Arrange-Act-Assert

```typescript
// pages.service.spec.ts
describe('PagesService', () => {
  let service: PagesService;
  let prisma: { page: { findMany: jest.Mock; create: jest.Mock } };

  beforeEach(async () => {
    prisma = { page: { findMany: jest.Mock(), create: jest.Mock() } };
    const module = await Test.createTestingModule({
      providers: [
        PagesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(PagesService);
  });

  describe('findAll', () => {
    it('should return all pages', async () => {
      const expected = [{ id: '1', title: 'Test' }];
      prisma.page.findMany.mockResolvedValue(expected);
      expect(await service.findAll()).toEqual(expected);
    });
  });
});
```

### E2E Tests

- File: `test/*.e2e-spec.ts`
- Dùng `supertest` để test HTTP endpoints
- Test cả auth flow (login → get token → use token)

### Coverage Target

- Services: 80%+
- Controllers: 80%+
- Guards/Strategies: 90%+

---

## Database Schema

3 models: `Page`, `Section`, `Admin`
- `Page 1---* Section` with cascade delete
- `Admin` is standalone (auth only)
- `Section.content` is `Json` type — flexible, FE defines the shape
- `Section.type`: `hero`, `features`, `cta`, `stats`, `testimonials`

---

## Adding a New Feature

1. Create module directory under `src/modules/`
2. Define DTOs with `class-validator` + `@ApiProperty()` decorators
3. Service: inject `PrismaService`, implement CRUD, add logging
4. Controller: define routes, add Swagger decorators, apply guards
5. Register module in `app.module.ts`
6. Run `npx prisma migrate dev` nếu schema thay đổi
7. Viết unit tests cho service
8. Viết e2e tests cho controller

---

## Seed Data

`npx prisma db seed` tạo:
- Admin: `admin` / `123456`
- 5 sample pages với đầy đủ 5 loại sections

---

## Common Commands

```bash
npm run start:dev           # Dev server with hot reload
npx prisma migrate dev      # Run migrations
npx prisma db seed          # Seed database
npx prisma studio           # Open Prisma Studio (DB viewer)
npm run test                # Unit tests
npm run test:e2e            # E2E tests
npm run test:cov            # Test coverage
```
