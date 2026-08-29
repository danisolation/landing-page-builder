# src/ — Thư mục gốc của Backend

> 📖 File này giúp bạn hiểu toàn bộ cấu trúc backend. Đọc từ trên xuống.

---

## Bạn đang ở đâu?

```
landing-page-be/
├── src/                    ← Bạn đang ở đây
├── prisma/                 ← Database schema + seed data
├── test/                   ← E2E tests
├── .env                    ← Biến môi trường (DATABASE_URL, JWT_SECRET)
├── package.json            ← Dependencies
└── tsconfig.json           ← TypeScript config
```

---

## src/ chứa gì?

```
src/
├── main.ts                 ← 🚪 CỬA VÀO — App start từ đây
├── app.module.ts           ← 📋 SƠ ĐỒ TỔ CHỨC — Ai làm gì
├── app.controller.ts       ← Route "/" (chỉ test)
├── app.service.ts          ← Logic cho route "/"
│
├── common/                 ← 🧰 HỘP DỤNG CỤ — Code dùng chung
│   ├── filters/            ← Bắt lỗi → format response
│   └── interceptors/       ← Xử lý request/response (log, wrap)
│
├── config/                 ← ⚙️ CẤU HÌNH — Env vars, validation
│
├── prisma/                 ← 🗄️ DATABASE — Kết nối PostgreSQL
│
├── auth/                   ← 🔐 ĐĂNG NHẬP — JWT, guards, login/register
│
├── pages/                  ← 📄 QUẢN LÝ TRANG — CRUD pages
│
└── sections/               ← 📦 QUẢN LÝ SECTION — CRUD sections trong page
```

---

## Request đi qua đâu?

```
Client → main.ts → Middleware → Guard → Pipe → Controller → Service → Prisma → Database
                                                          ↑
                                                    Bạn viết code ở đây
```

1. **main.ts** — Setup mọi thứ (CORS, validation, security, docs)
2. **Guard** — Kiểm tra auth (có token không? có quyền không?)
3. **Pipe** — Validate data đầu vào (title có rỗng không?)
4. **Controller** — Nhận request, gọi service, trả response
5. **Service** — Business logic (query DB, xử lý data)
6. **Prisma** — Chuyển code → SQL → PostgreSQL

---

## Module là gì?

Mỗi feature = 1 module. Module chứa:
- **Controller** — Route handlers (nhận request)
- **Service** — Business logic (xử lý)
- **DTO** — Data shape (validate input)
- **Module** — Đăng ký tất cả vào NestJS

```
auth/
├── auth.module.ts        ← Module: "Tôi là auth, tôi chứa controller + service"
├── auth.controller.ts    ← Controller: "POST /auth/login → tôi xử lý"
├── auth.service.ts       ← Service: "Tìm user trong DB, so sánh password"
└── dto/
    └── login.dto.ts      ← DTO: "username: string, password: string"
```

---

## Thứ tự đọc code

1. `main.ts` — Xem app setup những gì
2. `app.module.ts` — Xem có những module nào
3. `prisma/prisma.service.ts` — Xem kết nối database
4. `auth/auth.controller.ts` — Xem login/register hoạt động ra sao
5. `pages/pages.controller.ts` — Xem CRUD pages
6. `sections/sections.controller.ts` — Xem CRUD sections
7. `common/` — Xem error handling, logging, response format
