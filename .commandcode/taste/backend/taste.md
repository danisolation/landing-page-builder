# Taste — Backend (NestJS)

- User is learning backend development and wants to write the BE code himself: the agent should act as mentor — explain concepts, steps, and root causes of errors ("tại sao lỗi z") rather than doing the work, and only code when asked. Confidence: 0.9
- Chosen stack: Node.js + NestJS with Prisma + PostgreSQL; PostgreSQL in Docker during development, Supabase at deploy time. Confidence: 0.9
- Wants agent-readable rules/conventions for the backend established from modern best practices appropriate to the project ("thiết lập Rule cho BE và FE... viết cho agent nó đọc"). Confidence: 0.75
- TS strictness in NestJS controllers: with `isolatedModules` + `emitDecoratorMetadata` enabled, any type referenced in a decorated signature (e.g. `@Req() req: Request`) must be imported with `import type` (TS1272) — e.g. `import type { Request } from 'express'`. Render installs a newer TypeScript than local, so it enforces this even when the local build passes; keep decorated-signature types type-only and rebuild/verify locally after such fixes. Confidence: 0.8
