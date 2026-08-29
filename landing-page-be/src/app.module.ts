import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PagesModule } from './pages/pages.module';
import { SectionsModule } from './sections/sections.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { validate } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate, // Validate env vars khi startup — fail fast nếu thiếu
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 phút
        limit: 30, // 30 requests/phút
      },
    ]),
    PrismaModule,
    PagesModule,
    SectionsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // Auth guard — tất cả routes protected mặc định
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, // Rate limiting — 30 req/phút
    },
  ],
})
export class AppModule {}
