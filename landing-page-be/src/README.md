# src/ -- Backend Root Directory

> This guide helps you understand the entire backend structure. Read from top to bottom.

---

## Where are you?

```
landing-page-be/
├── src/                    ← You are here
├── prisma/                 ← Database schema + seed data
├── test/                   ← E2E tests
├── .env                    ← Environment variables (DATABASE_URL, JWT_SECRET)
├── package.json            ← Dependencies
└── tsconfig.json           ← TypeScript config
```

---

## What's inside src/?

```
src/
├── main.ts                 ← ENTRY POINT — App starts here
├── app.module.ts           ← OVERVIEW — Who does what
├── app.controller.ts       ← Route "/" (test only)
├── app.service.ts          ← Logic for route "/"
│
├── common/                 ← TOOLBOX — Shared code
│   ├── filters/            ← Catch errors → format responses
│   └── interceptors/       ← Process request/response (log, wrap)
│
├── config/                 ← CONFIGURATION — Env vars, validation
│
├── prisma/                 ← DATABASE — PostgreSQL connection
│
├── auth/                   ← AUTHENTICATION — JWT, guards, login/register
│
├── pages/                  ← PAGES MANAGEMENT — CRUD pages
│
└── sections/               ← SECTIONS MANAGEMENT — CRUD sections within a page
```

---

## Request flow

```
Client → main.ts → Middleware → Guard → Pipe → Controller → Service → Prisma → Database
                                                          ↑
                                                    You write code here
```

1. **main.ts** — Sets up everything (CORS, validation, security, docs)
2. **Guard** — Checks authentication (is there a token? Is the user authorized?)
3. **Pipe** — Validates input data (is the title empty?)
4. **Controller** — Receives the request, calls the service, returns a response
5. **Service** — Business logic (query DB, process data)
6. **Prisma** — Translates code → SQL → PostgreSQL

---

## What is a Module?

Each feature = one module. A module contains:
- **Controller** — Route handlers (receive requests)
- **Service** — Business logic (processing)
- **DTO** — Data shape (validate input)
- **Module** — Registers everything with NestJS

```
auth/
├── auth.module.ts        ← Module: "I am auth, I contain controller + service"
├── auth.controller.ts    ← Controller: "POST /auth/login → I handle it"
├── auth.service.ts       ← Service: "Find user in DB, compare password"
└── dto/
    └── login.dto.ts      ← DTO: "username: string, password: string"
```

---

## Recommended reading order

1. `main.ts` — See what the app sets up
2. `app.module.ts` — See which modules exist
3. `prisma/prisma.service.ts` — See the database connection
4. `auth/auth.controller.ts` — See how login/register works
5. `pages/pages.controller.ts` — See CRUD pages
6. `sections/sections.controller.ts` — See CRUD sections
7. `common/` — See error handling, logging, response format
