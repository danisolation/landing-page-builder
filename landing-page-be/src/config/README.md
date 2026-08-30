# config/ -- Application Configuration

> Manages environment variables.

---

## env.validation.ts -- Why is it needed?

The `.env` file contains sensitive information:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/landing_page"
JWT_SECRET="dev-secret-change-in-production"
```

**The problem:** If you forget to set `DATABASE_URL`:
- The app crashes with a confusing Prisma error
- You waste 30 minutes figuring out it's a missing env var

**The solution:** Validate on startup:
- Missing `DATABASE_URL` → crash immediately with a clear message
- Missing `JWT_SECRET` → crash immediately, no insecure fallback

---

## How it works

```typescript
class EnvironmentVariables {
  @IsString()
  DATABASE_URL!: string;    // ← Required

  @IsString()
  JWT_SECRET!: string;      // ← Required

  @IsOptional()
  NODE_ENV?: string;        // ← Optional
}
```

When the app starts:
1. Reads the `.env` file
2. Creates an `EnvironmentVariables` instance
3. Runs validation (class-validator)
4. If a required field is missing → throws an Error → app crashes
5. If OK → continues running

---

## What does `!` mean?

```typescript
DATABASE_URL!: string;
//           ^ This is called a "definite assignment assertion"
```

It means: "TypeScript, this variable will be assigned a value at runtime (by class-validator), so the compiler doesn't need to check."

Without `!`, TypeScript reports an error: "Property 'DATABASE_URL' has no initializer."

---

## Usage

In `app.module.ts`:
```typescript
ConfigModule.forRoot({
  isGlobal: true,    // ConfigService available in every module
  validate,          // Runs validation on startup
})
```

Then in any service:
```typescript
constructor(private configService: ConfigService) {
  const dbUrl = this.configService.get<string>('DATABASE_URL');
}
```
