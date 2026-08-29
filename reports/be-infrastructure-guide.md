# Hướng dẫn: Triển khai BE Infrastructure

> Dựa trên: `landing-page-be/CLAUDE.md` — Production Readiness Standards
> Ngày: 2026-08-29

---

## Tổng quan

Backend hiện tại có CRUD + Auth hoạt động OK, nhưng thiếu các thành phần production-ready. Hướng dẫn này sẽ chỉ bạn cách implement từng phần.

**Thứ tự ưu tiên:** Error Handling → Response Format → Security → Docs → Logging

---

## 1. Global Exception Filter

**Vấn đề:** Prisma throw lỗi raw → client thấy stack trace hoặc lỗi không rõ ràng.

**Cần tạo:** `src/common/filters/prisma-exception.filter.ts`

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response, Request } from 'express';

// Map Prisma error codes → HTTP status + message tiếng Việt
const PRISMA_ERROR_MAP: Record<string, { status: number; message: string }> = {
  P2000: { status: HttpStatus.BAD_REQUEST, message: 'Dữ liệu quá dài cho trường này' },
  P2001: { status: HttpStatus.NOT_FOUND, message: 'Không tìm thấy bản ghi' },
  P2002: { status: HttpStatus.CONFLICT, message: 'Dữ liệu đã tồn tại (trùng slug hoặc username)' },
  P2003: { status: HttpStatus.BAD_REQUEST, message: 'Tham chiếu khóa ngoại không hợp lệ' },
  P2014: { status: HttpStatus.BAD_REQUEST, message: 'Bắt buộc phải có liên kết' },
  P2025: { status: HttpStatus.NOT_FOUND, message: 'Không tìm thấy bản ghi để cập nhật/xóa' },
};

@Catch()
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Prisma errors
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const mapped = PRISMA_ERROR_MAP[exception.code];
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
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: 500,
      message: 'Lỗi hệ thống, vui lòng thử lại sau',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

**Cách dùng:** Register global trong `main.ts`:
```typescript
app.useGlobalFilters(new PrismaExceptionFilter());
```

**Tại sao cần:**
- Prisma P2002 (unique constraint) → khi tạo page trùng slug → client thấy 409 thay vì 500
- Prisma P2025 (not found) → khi update/xóa record không tồn tại → client thấy 404
- Unknown errors → không lộ stack trace cho hacker

---

## 2. Response Interceptor

**Vấn đề:** Controller trả raw Prisma object → không có format thống nhất.

**Cần tạo:** `src/common/interceptors/response.interceptor.ts`

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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

**Cách dùng:** Register global trong `main.ts`:
```typescript
app.useGlobalInterceptors(new ResponseInterceptor());
```

**Kết quả:** Tất cả API response đều có format:
```json
{
  "success": true,
  "data": { "id": "...", "title": "..." },
  "timestamp": "2026-08-29T12:00:00.000Z"
}
```

---

## 3. RegisterDto

**Vấn đề:** `/auth/register` dùng inline type, không validate độ dài username/password.

**Cần tạo:** `src/auth/dto/register.dto.ts`

```typescript
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  username!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(100)
  password!: string;
}
```

**Cập nhật `auth.controller.ts`:**
```typescript
import { RegisterDto } from './dto/register.dto';

@Public()
@Post('register')
async register(@Body() dto: RegisterDto) {  // ← dùng RegisterDto thay vì inline type
  return this.authService.register(dto.username, dto.password);
}
```

**Cập nhật `auth.service.ts` — không trả password hash:**
```typescript
async register(username: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const admin = await this.prisma.admin.create({
    data: { username, password: hashedPassword },
  });

  // Không trả password hash về client
  const { password: _, ...result } = admin;
  return result;
}
```

---

## 4. Environment Validation

**Vấn đề:** Nếu thiếu `DATABASE_URL` → app crash với lỗi Prisma khó hiểu. Thiếu `JWT_SECRET` → dùng fallback `'default-secret'` (rất insecure).

**Cần tạo:** `src/config/env.validation.ts`

```typescript
import { plainToInstance } from 'class-transformer';
import { IsString, IsEnum, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsEnum(['development', 'production', 'test'])
  NODE_ENV: string;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  JWT_SECRET: string;
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

**Cập nhật `app.module.ts`:**
```typescript
import { validate } from './config/env.validation';

ConfigModule.forRoot({
  isGlobal: true,
  validate,  // ← thêm validate
}),
```

**Cập nhật `jwt.strategy.ts` — loại bỏ fallback:**
```typescript
constructor(private configService: ConfigService) {
  const jwtSecret = configService.get<string>('JWT_SECRET');
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  super({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    ignoreExpiration: false,
    secretOrKey: jwtSecret,  // ← không còn fallback 'default-secret'
  });
}
```

---

## 5. CORS + PORT từ env

**Cập nhật `main.ts`:**

```typescript
// CORS — dùng env var
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true,
});

// PORT từ env
const port = process.env.PORT || 3000;
await app.listen(port);
```

---

## 6. Helmet (Security Headers)

**Cài đặt:**
```bash
npm install helmet
```

**Cập nhật `main.ts`:**
```typescript
import helmet from 'helmet';

app.use(helmet());
```

**Tại sao:** Bảo vệ khỏi clickjacking, XSS, MIME sniffing, v.v.

---

## 7. Rate Limiting

**Cài đặt:**
```bash
npm install @nestjs/throttler
```

**Cập nhật `app.module.ts`:**
```typescript
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,  // 1 phút
      limit: 30,   // 30 requests/phút
    }),
    // ... other imports
  ],
  providers: [
    // ... other providers
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
```

**Auth endpoints — giới hạn nghiêm ngặt hơn (5 attempts/phút):**
```typescript
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
@Throttle({ default: { limit: 5, ttl: 60000 } })
export class AuthController { ... }
```

---

## 8. Swagger API Docs

**Cài đặt:**
```bash
npm install @nestjs/swagger
```

**Cập nhật `main.ts`:**
```typescript
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

**Thêm decorators vào DTOs:**
```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreatePageDto {
  @ApiProperty({ example: 'Sản phẩm mới', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;
}
```

**Thêm decorators vào Controllers:**
```typescript
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Pages')
@Controller('pages')
export class PagesController {
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả trang' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  findAll() { ... }
}
```

**Truy cập:** `http://localhost:3000/api/docs`

---

## 9. Request Logging Interceptor

**Cần tạo:** `src/common/interceptors/logging.interceptor.ts`

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

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

**Cách dùng:** Register global trong `main.ts`:
```typescript
app.useGlobalInterceptors(new LoggingInterceptor());
```

---

## 10. Service Logging

Thêm `Logger` vào mỗi service:

```typescript
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PagesService {
  private readonly logger = new Logger(PagesService.name);

  async findAll() {
    this.logger.log('Fetching all pages');
    // ...
  }

  async create(dto: CreatePageDto) {
    this.logger.log(`Creating page: ${dto.title}`);
    // ...
  }
}
```

---

## Thứ tự thực hiện

```
1. mkdir -p src/common/filters src/common/interceptors src/config
2. Tạo Exception Filter → register trong main.ts
3. Tạo Response Interceptor → register trong main.ts
4. Tạo RegisterDto → cập nhật auth controller + service
5. Tạo env.validation.ts → cập nhật app.module.ts + jwt.strategy.ts
6. Fix CORS + PORT trong main.ts
7. npm install helmet → thêm vào main.ts
8. npm install @nestjs/throttler → cập nhật app.module.ts + auth controller
9. npm install @nestjs/swagger → cập nhật main.ts + DTOs + controllers
10. Tạo Logging Interceptor → register trong main.ts
11. Thêm Logger vào services
```

---

## Kiểm tra

Sau khi implement xong:

```bash
# Build check
npm run build

# Run dev
npm run start:dev

# Test Swagger
# Mở http://localhost:3000/api/docs

# Test validation
# POST /auth/register với username "ab" → expect 400 (too short)
# POST /auth/register với password "123" → expect 400 (too short)

# Test error handling
# POST /pages với slug trùng → expect 409 (conflict)
# GET /pages/invalid-id → expect 404

# Test rate limiting
# Gửi 6 request liên tiếp → expect 429 (too many requests)
```
