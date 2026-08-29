# Báo cáo: Implement JWT Auth Guard

> Ngày: 2026-08-29
> Feature: Bảo vệ Page/Section endpoints bằng JWT authentication

---

## Mục tiêu

Trước khi implement:
- ❌ Ai cũng có thể CRUD pages/sections mà không cần đăng nhập
- ❌ Chỉ `GET /auth/profile` có JWT guard
- ❌ Security gap nghiêm trọng

Sau khi implement:
- ✅ Tất cả Page/Section CRUD endpoints yêu cầu JWT token
- ✅ Login, register, health check, findBySlug là public
- ✅ Global auth guard áp dụng cho toàn bộ ứng dụng

---

## Vấn đề gặp phải

### Vấn đề 1: Global guard chặn cả health check

**Triệu chứng**: `GET /` trả 401 Unauthorized

**Nguyên nhân**: Global `JwtAuthGuard` áp dụng cho TẤT CẢ endpoints, kể cả `GET /` (health check)

**Giải pháp**: Tạo `@Public()` decorator để đánh dấu các route không cần auth

```typescript
// public.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

```typescript
// app.controller.ts
@Public()  // ← Bỏ qua auth
@Get()
getHello(): string {
  return this.appService.getHello();
}
```

**Bài học**: Khi áp dụng global rule, phải nghĩ đến exceptions. Luôn có cơ chế bypass.

---

### Vấn đề 2: Token không được verify (401 dù có token)

**Triệu chứng**: Login thành công, có token, nhưng gọi API vẫn 401

**Nguyên nhân**: `process.env.JWT_SECRET` chưa load khi module khởi tạo

**Tại sao xảy ra**:
```
Thứ tự khởi tạo NestJS:
1. AppModule imports
2. AuthModule.register({ secret: process.env.JWT_SECRET })
   ↑ process.env.JWT_SECRET = undefined (chưa load .env)
3. ConfigModule.forRoot() ← load .env (quá muộn!)
```

**Giải pháp**: Dùng `registerAsync` với `ConfigService`

```typescript
// auth.module.ts — TRƯỚC (lỗi)
JwtModule.register({
  secret: process.env.JWT_SECRET || 'default-secret',  // ← undefined
})

// auth.module.ts — SAU (đúng)
JwtModule.registerAsync({
  useFactory: (configService: ConfigService) => ({
    secret: configService.get<string>('JWT_SECRET', 'default-secret'),
    // ↑ ConfigService đảm bảo .env đã load
  }),
  inject: [ConfigService],
})
```

**Bài học**: Không dùng `process.env` trực tiếp trong module. Dùng `ConfigService` để đảm bảo thứ tự load.

---

### Vấn đề 3: app.useGlobalGuards() không hoạt động với Passport

**Triệu chứng**: Dùng `app.useGlobalGuards(new JwtAuthGuard(reflector))` → Passport không verify token

**Nguyên nhân**: Khi tạo guard instance thủ công (`new JwtAuthGuard(reflector)`), Passport strategy không được connect đúng cách

**Giải pháp**: Dùng `APP_GUARD` token trong module

```typescript
// app.module.ts
import { APP_GUARD } from '@nestjs/core';

@Module({
  providers: [
    AppService,
    {
      provide: APP_GUARD,      // ← NestJS tự inject DI
      useClass: JwtAuthGuard,  // ← Passport hoạt động đúng
    },
  ],
})
export class AppModule {}
```

**Bài học**: NestJS có nhiều cách đăng ký global guard. `APP_GUARD` là cách recommended vì giữ nguyên DI.

---

## Files thay đổi

### 1. `src/auth/public.decorator.ts` (Tạo mới)

```typescript
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

**Giải thích**:
- `SetMetadata` gắn key-value vào method/class
- `@Public()` = `SetMetadata('isPublic', true)`
- Guard đọc metadata này để quyết định bypass hay verify

---

### 2. `src/auth/jwt-auth.guard.ts` (Sửa)

```typescript
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),    // method level
      context.getClass(),      // controller level
    ]);

    if (isPublic) {
      return true;  // Bypass auth
    }

    return super.canActivate(context);  // Passport JWT verify
  }
}
```

**Giải thích**:
- `extends AuthGuard('jwt')` — kế thừa Passport JWT guard
- `Reflector` — đọc metadata từ decorator
- `getAllAndOverride` — check cả method lẫn controller, method ưu tiên hơn
- `super.canActivate(context)` — gọi Passport flow (extract token → verify → validate)

---

### 3. `src/auth/auth.module.ts` (Sửa)

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'default-secret'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

**Thay đổi**:
- `JwtModule.register()` → `JwtModule.registerAsync()`
- Dùng `ConfigService` thay vì `process.env`
- Đảm bảo .env load trước khi JWT module init

---

### 4. `src/auth/jwt.strategy.ts` (Sửa)

```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'default-secret'),
    });
  }

  async validate(payload: any) {
    return { id: payload.sub, username: payload.username };
  }
}
```

**Thay đổi**:
- Inject `ConfigService` vào constructor
- Dùng `configService.get()` thay vì `process.env`

---

### 5. `src/auth/auth.controller.ts` (Sửa)

```typescript
import { Controller, Post, Get, Body, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()        // ← Public: ai cũng register được
  @Post('register')
  async register(@Body() body: { username: string; password: string }) {
    return this.authService.register(body.username, body.password);
  }

  @Public()        // ← Public: ai cũng login được
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // ← Protected: cần token
  @Get('profile')
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.id);
  }
}
```

**Thay đổi**:
- Xóa `@UseGuards(JwtAuthGuard)` (global guard đã lo)
- Thêm `@Public()` trên login, register

---

### 6. `src/pages/pages.controller.ts` (Sửa)

```typescript
import { Public } from '../auth/public.decorator';

@Controller('pages')
export class PagesController {
  // ...

  @Public()  // ← Public cho landing page FE
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.pagesService.findBySlug(slug);
  }

  // Các route khác → cần token (global guard bảo vệ)
}
```

**Thay đổi**:
- Thêm `@Public()` trên `findBySlug`
- Các route khác giữ nguyên (global guard bảo vệ)

---

### 7. `src/app.module.ts` (Sửa)

```typescript
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Module({
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
```

**Thay đổi**:
- Thêm `APP_GUARD` provider
- Xóa `app.useGlobalGuards()` trong main.ts

---

### 8. `src/app.controller.ts` (Sửa)

```typescript
import { Public } from './auth/public.decorator';

@Controller()
export class AppController {
  @Public()  // ← Health check, không cần auth
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
```

---

### 9. `src/main.ts` (Sửa)

```typescript
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: 'http://localhost:3001' });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // Xóa app.useGlobalGuards() — dùng APP_GUARD trong AppModule

  await app.listen(3000);
}
bootstrap();
```

---

## Test Results

| # | Test Case | Endpoint | Token | Expected | Actual | Status |
|---|---|---|---|---|---|---|
| 1 | No token → 401 | `GET /pages` | ❌ | 401 | 401 | ✅ |
| 2 | With token → 200 | `GET /pages` | ✅ | 200 | 200 | ✅ |
| 3 | Profile with token | `GET /auth/profile` | ✅ | 200 | 200 | ✅ |
| 4 | Public slug | `GET /pages/slug/san-pham-moi` | ❌ | 200 | 200 | ✅ |
| 5 | Create without token | `POST /pages` | ❌ | 401 | 401 | ✅ |
| 6 | Health check | `GET /` | ❌ | 200 | 200 | ✅ |
| 7 | Login (public) | `POST /auth/login` | ❌ | 200 | 200 | ✅ |
| 8 | Register (public) | `POST /auth/register` | ❌ | 200 | 200 | ✅ |

---

## Kiến trúc sau khi implement

```
Request Flow:
Client → CORS → JwtAuthGuard → Controller → Service → Prisma → DB
                  │
                  ├── @Public()? → skip auth
                  └── No? → Passport JWT verify → 401 if invalid

Endpoints:
├── POST /auth/login      → @Public()
├── POST /auth/register   → @Public()
├── GET /                 → @Public()
├── GET /pages/slug/:slug → @Public()
├── GET /pages            → 🔒 need token
├── GET /pages/:id        → 🔒 need token
├── POST /pages           → 🔒 need token
├── PATCH /pages/:id      → 🔒 need token
├── DELETE /pages/:id     → 🔒 need token
└── ALL /pages/:pageId/sections/* → 🔒 need token
```

---

## Bài học rút ra

1. **Global rules cần có exception mechanism** — `@Public()` decorator
2. **Không dùng `process.env` trực tiếp** — dùng `ConfigService` để đảm bảo thứ tự load
3. **DI quan trọng** — `APP_GUARD` tốt hơn `app.useGlobalGuards()` vì giữ nguyên DI
4. **Test ngay sau khi code** — phát hiện lỗi sớm (token không verify, health check bị chặn)
5. **Đọc error message kỹ** — "Unauthorized" có thể do nhiều nguyên nhân khác nhau

---

## Security improvements tiếp theo

- [ ] Thêm `@Public()` register protection (invite code hoặc chỉ cho phép admin đầu tiên)
- [ ] Rate limiting cho login endpoint (chống brute force)
- [ ] Input sanitization cho content JSON (chống XSS)
- [ ] Loại bỏ password khỏi register response
