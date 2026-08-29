# common/ — Hộp công cụ dùng chung

> 📖 Code ở đây KHÔNG thuộc feature nào. Mọi module đều có thể dùng.

---

## Tại sao cần common/?

Giả sử bạn có 3 module: auth, pages, sections. Mỗi module đều cần:
- Bắt lỗi Prisma → HTTP response
- Log request
- Wrap response format

Nếu viết riêng cho mỗi module → lặp code 3 lần. Viết 1 lần trong `common/` → mọi module đều dùng được.

---

## Cấu trúc

```
common/
├── filters/
│   └── prisma-exception.filter.ts   ← Bắt lỗi DB → response chuẩn
└── interceptors/
    ├── response.interceptor.ts      ← Wrap { success, data, timestamp }
    └── logging.interceptor.ts       ← Log "POST /pages 42ms"
```

---

## filters/ — Bắt lỗi

**NestJS có khái niệm "Exception Filter"** — nó bắt lỗi và format lại response.

Nếu KHÔNG có filter:
```
Lỗi Prisma P2002 → Client thấy: { "statusCode": 500, "message": "Internal Server Error" }
                   → Hoặc worse: { "statusCode": 500, "stack": "at line 42..." }
```

Nếu CÓ filter:
```
Lỗi Prisma P2002 → Client thấy: {
  "success": false,
  "statusCode": 409,
  "message": "Dữ liệu đã tồn tại (trùng slug hoặc username)",
  "timestamp": "2026-08-29T12:00:00.000Z",
  "path": "/pages"
}
```

**Cách dùng:** Đăng ký trong `main.ts`:
```typescript
app.useGlobalFilters(new PrismaExceptionFilter());
```

---

## interceptors/ — Xử lý request/response

**Interceptor** chạy TRƯỚC và SAU khi controller xử lý:

```
Request vào → Interceptor (trước) → Controller → Interceptor (sau) → Response ra
```

### response.interceptor.ts
Chạy SAU controller. Lấy data controller trả về, wrap thành format chuẩn:
```typescript
// Controller trả: { id: "1", title: "Test" }
// Interceptor wrap thành: { success: true, data: { id: "1", title: "Test" }, timestamp: "..." }
```

### logging.interceptor.ts
Chạy SAU controller. Ghi log thời gian xử lý:
```typescript
// Log: "POST /pages 42ms"
```

**Cách dùng:** Đăng ký trong `main.ts`:
```typescript
app.useGlobalInterceptors(
  new LoggingInterceptor(),    // Chạy trước (log trước)
  new ResponseInterceptor(),   // Chạy sau (wrap response)
);
```

---

## Lưu ý quan trọng

- **Thứ tự đăng ký quan trọng** — Logging trước, Response sau
- **Filter chạy khi có lỗi** — Interceptor chạy khi thành công
- **Global = mọi route** — Không cần đăng ký từng controller
