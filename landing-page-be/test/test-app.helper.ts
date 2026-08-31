import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, CanActivate, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppModule } from './../src/app.module';
import { PrismaExceptionFilter } from './../src/common/filters/prisma-exception.filter';
import { ResponseInterceptor } from './../src/common/interceptors/response.interceptor';

// Pass-through guard that disables rate limiting in tests
class NoThrottleGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean {
    return true;
  }
}

export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(APP_GUARD)
    .useClass(NoThrottleGuard)
    .compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.useGlobalFilters(new PrismaExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  await app.init();
  return app;
}
