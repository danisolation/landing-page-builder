import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';  // ← Import

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,              // Bỏ field không có trong DTO
    forbidNonWhitelisted: true,   // Báo lỗi nếu có field lạ
  }));

  await app.listen(3000);
}
bootstrap();