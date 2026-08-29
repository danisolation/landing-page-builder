# auth/ — Module xác thực (Authentication)

> 📖 Xử lý đăng nhập, đăng ký, bảo vệ route.

---

## auth/ làm gì?

```
POST /auth/register  → Tạo tài khoản admin (public)
POST /auth/login     → Đăng nhập, trả JWT token (public)
GET  /auth/profile   → Lấy thông tin user (cần token)
```

---

## Cách auth hoạt động

### 1. Đăng ký (Register)
```
Client → POST /auth/register { username: "admin", password: "123456" }
  → RegisterDto validate (username 3-50 ký tự, password 8-100 ký tự)
  → AuthService.register()
  → Hash password bằng bcrypt (12 rounds)
  → Lưu vào database
  → Trả user info (KHÔNG trả password hash)
```

### 2. Đăng nhập (Login)
```
Client → POST /auth/login { username: "admin", password: "123456" }
  → LoginDto validate
  → AuthService.login()
  → Tìm user trong database
  → So sánh password (bcrypt.compare)
  → Nếu OK → tạo JWT token → trả { access_token: "..." }
  → Nếu sai → trả 401 Unauthorized
```

### 3. Bảo vệ route (Guard)
```
Client → GET /pages (có header Authorization: Bearer <token>)
  → JwtAuthGuard kiểm tra token
  → Nếu token hợp lệ → cho vào controller
  → Nếu token sai/hết hạn → trả 401
  → Nếu route có @Public() decorator → skip guard
```

---

## Các file trong auth/

```
auth/
├── auth.module.ts          ← Đăng ký controller, service, strategy vào NestJS
├── auth.controller.ts      ← Route handlers (POST /login, POST /register, GET /profile)
├── auth.service.ts         ← Business logic (hash password, tạo token, tìm user)
├── jwt.strategy.ts         ← Passport strategy: giải mã JWT token
├── jwt-auth.guard.ts       ← Guard: kiểm tra token trước khi vào controller
├── public.decorator.ts     ← @Public() decorator: bypass guard
└── dto/
    ├── login.dto.ts        ← Validate { username, password }
    └── register.dto.ts     ← Validate { username: 3-50 ký tự, password: 8-100 ký tự }
```

---

## JWT là gì?

JWT (JSON Web Token) = chuỗi mã hóa chứa thông tin user:
```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidXNlcm5hbWUiOiJhZG1pbiJ9.signature
│← Header →│.│← Payload (userId, username) →│.│← Signature (verify) →│
```

**Flow:**
1. Login → server tạo JWT token
2. Client lưu token (localStorage/cookie)
3. Mỗi request → client gửi token trong header: `Authorization: Bearer <token>`
4. Server giải mã token → biết user là ai

**Tại sao dùng JWT thay vì session?**
- Stateless: server không cần lưu session → dễ scale
- Cross-domain: token hoạt động trên mọi domain
- Mobile-friendly: mobile app dễ gửi token

---

## Guard là gì?

Guard = "bảo vệ" route. Có 2 loại:

### JwtAuthGuard (global)
- Áp dụng cho TẤT CẢ routes
- Kiểm tra token hợp lệ
- Nếu route có `@Public()` → skip

### ThrottlerGuard (global)
- Áp dụng cho TẤT CẢ routes
- Giới hạn request/phút
- Auth endpoints: 5/phút, các route khác: 30/phút

---

## @Public() decorator là gì?

```typescript
@Public()           // ← Bypass JwtAuthGuard
@Post('login')
async login(@Body() dto: LoginDto) { ... }
```

Nếu không có `@Public()`:
- `POST /auth/login` → yêu cầu token → nhưng chưa đăng nhập → paradox!

Với `@Public()`:
- `POST /auth/login` → skip guard → cho vào controller
