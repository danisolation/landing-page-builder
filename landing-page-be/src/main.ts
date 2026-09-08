import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { join } from 'path';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('Bootstrap');

  // Trust proxy (Render/Vercel) so req.protocol reflects the real scheme
  app.set('trust proxy', 1);

  // Security headers — protect against clickjacking, XSS, MIME sniffing
  app.use(helmet());

  // Gzip JSON responses — section content compresses 5-10x
  app.use(compression());

  // CORS — use env var, no hardcoded origin
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  });

  // Global pipes — transform: true to auto-convert query params
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global exception filter — Prisma errors → standard HTTP response
  app.useGlobalFilters(new PrismaExceptionFilter());

  // Global interceptors — logging + response wrapper
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new ResponseInterceptor(),
  );

  // Swagger API docs — dev only; building the document adds cold-start time
  if (process.env.NODE_ENV !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Landing Page Builder API')
      .setDescription(
        '## Overview\n\n' +
          'Backend for the Landing Page Builder — a NestJS API for managing\n' +
          'published landing pages, their sections, media uploads, and templates.\n\n' +
          '## Response format\n\n' +
          'Every endpoint wraps its payload in a uniform envelope:\n' +
          '```json\n{ "success": true, "data": <payload>, "timestamp": "ISO-8601" }\n```\n' +
          'Errors use the standard NestJS shape: `{ "statusCode", "message", "error" }`.\n\n' +
          '## Authentication\n\n' +
          'Most endpoints require a JWT. Call `POST /auth/login` to obtain a token,\n' +
          'then pass it as `Authorization: Bearer <token>`. Public endpoints are\n' +
          'marked with a 🌐 globe and need no token.\n\n' +
          '## Rate limiting\n\n' +
          'Global: **30 requests / 60 s** per IP. Public page routes (`/pages/slug/*`,\n' +
          '`/pages/:id/view`) are exempt. Auth routes (`/auth/*`) are stricter:\n' +
          '**5 requests / 60 s** to deter brute force.',
      )
      .setVersion('1.0')
      .addServer('http://localhost:3000', 'Local development')
      .addServer('https://landing-page-be-qjsg.onrender.com', 'Production (Render)')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter the JWT returned by POST /auth/login',
        },
        'bearer',
      )
      .addTag('Auth', 'Authentication — login, registration, profile')
      .addTag('Pages', 'Landing pages — CRUD, publish, view tracking')
      .addTag('Sections', 'Page sections — the building blocks of a page')
      .addTag('Templates', 'Reusable page templates')
      .addTag('Media', 'Image upload and static serving')
      .addTag('System', 'Health and readiness checks')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
      customSiteTitle: 'Landing Page Builder API',
    });
  }

  // Serve uploaded media (public uploads dir → /uploads/*)
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' });

  // Graceful shutdown — allow NestJS to handle SIGTERM/SIGINT
  app.enableShutdownHooks();

  // PORT from env
  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`Application running on port ${port}`);
  logger.log(`Swagger docs: http://localhost:${port}/api/docs`);
  logger.log(`Health check: http://localhost:${port}/health`);
}

// Handle signals for graceful shutdown logging
process.on('SIGTERM', () => {
  new Logger('Shutdown').warn('SIGTERM received — shutting down gracefully');
});
process.on('SIGINT', () => {
  new Logger('Shutdown').warn('SIGINT received — shutting down gracefully');
});

bootstrap();
