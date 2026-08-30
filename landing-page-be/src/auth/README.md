# auth/ -- Authentication Module

> Handles login, registration, and route protection.

---

## What does auth/ do?

```
POST /auth/register  → Creates an admin account (public)
POST /auth/login     → Logs in, returns a JWT token (public)
GET  /auth/profile   → Returns user info (requires token)
```

---

## How auth works

### 1. Register
```
Client → POST /auth/register { username: "admin", password: "123456" }
  → RegisterDto validates (username 3-50 characters, password 8-100 characters)
  → AuthService.register()
  → Hashes password with bcrypt (12 rounds)
  → Saves to database
  → Returns user info (does NOT return the password hash)
```

### 2. Login
```
Client → POST /auth/login { username: "admin", password: "123456" }
  → LoginDto validates
  → AuthService.login()
  → Finds user in database
  → Compares password (bcrypt.compare)
  → If OK → creates JWT token → returns { access_token: "..." }
  → If wrong → returns 401 Unauthorized
```

### 3. Route protection (Guard)
```
Client → GET /pages (with header Authorization: Bearer <token>)
  → JwtAuthGuard checks the token
  → If token is valid → allows access to controller
  → If token is invalid/expired → returns 401
  → If route has @Public() decorator → skips the guard
```

---

## Files in auth/

```
auth/
├── auth.module.ts          ← Registers controller, service, strategy with NestJS
├── auth.controller.ts      ← Route handlers (POST /login, POST /register, GET /profile)
├── auth.service.ts         ← Business logic (hash password, create token, find user)
├── jwt.strategy.ts         ← Passport strategy: decodes JWT tokens
├── jwt-auth.guard.ts       ← Guard: checks token before entering controller
├── public.decorator.ts     ← @Public() decorator: bypasses the guard
└── dto/
    ├── login.dto.ts        ← Validates { username, password }
    └── register.dto.ts     ← Validates { username: 3-50 characters, password: 8-100 characters }
```

---

## What is JWT?

JWT (JSON Web Token) = an encoded string containing user information:
```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidXNlcm5hbWUiOiJhZG1pbiJ9.signature
│← Header →│.│← Payload (userId, username) →│.│← Signature (verify) →│
```

**Flow:**
1. Login → server creates a JWT token
2. Client stores the token (localStorage/cookie)
3. Each request → client sends the token in the header: `Authorization: Bearer <token>`
4. Server decodes the token → knows who the user is

**Why use JWT instead of sessions?**
- Stateless: the server doesn't need to store sessions → easy to scale
- Cross-domain: tokens work across every domain
- Mobile-friendly: mobile apps can easily send tokens

---

## What is a Guard?

A Guard "protects" routes. There are two types:

### JwtAuthGuard (global)
- Applies to ALL routes
- Checks that the token is valid
- If the route has `@Public()` → skips

### ThrottlerGuard (global)
- Applies to ALL routes
- Limits requests per minute
- Auth endpoints: 5/min, other routes: 30/min

---

## What is the @Public() decorator?

```typescript
@Public()           // ← Bypasses JwtAuthGuard
@Post('login')
async login(@Body() dto: LoginDto) { ... }
```

Without `@Public()`:
- `POST /auth/login` → requires a token → but the user hasn't logged in yet → paradox!

With `@Public()`:
- `POST /auth/login` → skips the guard → allows access to the controller
