# common/ -- Shared Utility Toolkit

> Code here does NOT belong to any specific feature. Every module can use it.

---

## Why do we need common/?

Suppose you have 3 modules: auth, pages, sections. Each module needs to:
- Catch Prisma errors → HTTP response
- Log requests
- Wrap response format

If you write this separately for each module → duplicated code 3 times. Write it once in `common/` → every module can use it.

---

## Structure

```
common/
├── filters/
│   └── prisma-exception.filter.ts   ← Catch DB errors → standard response
└── interceptors/
    ├── response.interceptor.ts      ← Wrap { success, data, timestamp }
    └── logging.interceptor.ts       ← Log "POST /pages 42ms"
```

---

## filters/ -- Error handling

**NestJS has a concept called "Exception Filter"** — it catches errors and reformats the response.

Without a filter:
```
Prisma error P2002 → Client sees: { "statusCode": 500, "message": "Internal Server Error" }
                   → Or worse: { "statusCode": 500, "stack": "at line 42..." }
```

With a filter:
```
Prisma error P2002 → Client sees: {
  "success": false,
  "statusCode": 409,
  "message": "Data already exists (duplicate slug or username)",
  "timestamp": "2026-08-29T12:00:00.000Z",
  "path": "/pages"
}
```

**Usage:** Register in `main.ts`:
```typescript
app.useGlobalFilters(new PrismaExceptionFilter());
```

---

## interceptors/ -- Request/response processing

**Interceptors** run BEFORE and AFTER the controller handles the request:

```
Request in → Interceptor (before) → Controller → Interceptor (after) → Response out
```

### response.interceptor.ts
Runs AFTER the controller. Takes the data the controller returns and wraps it into a standard format:
```typescript
// Controller returns: { id: "1", title: "Test" }
// Interceptor wraps it as: { success: true, data: { id: "1", title: "Test" }, timestamp: "..." }
```

### logging.interceptor.ts
Runs AFTER the controller. Logs the processing time:
```typescript
// Log: "POST /pages 42ms"
```

**Usage:** Register in `main.ts`:
```typescript
app.useGlobalInterceptors(
  new LoggingInterceptor(),    // Runs first (logs first)
  new ResponseInterceptor(),   // Runs second (wraps response)
);
```

---

## Important notes

- **Registration order matters** — Logging first, Response second
- **Filters run on errors** — Interceptors run on success
- **Global = all routes** — No need to register per controller
