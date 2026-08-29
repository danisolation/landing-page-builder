# config/ — Cấu hình ứng dụng

> 📖 Quản lý biến môi trường (environment variables).

---

## env.validation.ts — Tại sao cần?

`.env` file chứa thông tin nhạy cảm:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/landing_page"
JWT_SECRET="dev-secret-change-in-production"
```

**Vấn đề:** Nếu bạn quên set `DATABASE_URL`:
- App crash với lỗi Prisma khó hiểu
- Bạn mất 30 phút mới phát hiện do thiếu env var

**Giải pháp:** Validate khi startup:
- Thiếu `DATABASE_URL` → crash NGAY với message rõ ràng
- Thiếu `JWT_SECRET` → crash NGAY, không dùng fallback insecure

---

## Cách hoạt động

```typescript
class EnvironmentVariables {
  @IsString()
  DATABASE_URL!: string;    // ← Bắt buộc phải có

  @IsString()
  JWT_SECRET!: string;      // ← Bắt buộc phải có

  @IsOptional()
  NODE_ENV?: string;        // ← Không bắt buộc
}
```

Khi app khởi tạo:
1. Đọc `.env` file
2. Tạo instance `EnvironmentVariables`
3. Chạy validation (class-validator)
4. Nếu thiếu field bắt buộc → throw Error → app crash
5. Nếu OK → tiếp tục chạy

---

## Dấu `!` là gì?

```typescript
DATABASE_URL!: string;
//           ^ Dấu này gọi là "definite assignment assertion"
```

Nghĩa là: "TypeScript ơi, biến này sẽ được gán giá trị ở runtime (bởi class-validator), compiler không cần kiểm tra."

Nếu không có `!`, TypeScript báo lỗi: "Property 'DATABASE_URL' has no initializer."

---

## Cách dùng

Trong `app.module.ts`:
```typescript
ConfigModule.forRoot({
  isGlobal: true,    // ConfigService available ở mọi module
  validate,          // Chạy validation khi startup
})
```

Sau đó ở bất kỳ service nào:
```typescript
constructor(private configService: ConfigService) {
  const dbUrl = this.configService.get<string>('DATABASE_URL');
}
```
