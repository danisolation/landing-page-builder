import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:3001', // FE được phép gọi
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Bỏ field không có trong DTO
      forbidNonWhitelisted: true, // Báo lỗi nếu có field lạ
    }),
  );

  await app.listen(3000);
}
bootstrap();
