import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Security headers — protect against clickjacking, XSS, MIME sniffing
  app.use(helmet());

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

  // Swagger API docs
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Landing Page Builder API')
    .setDescription('API for managing landing pages and sections')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

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
