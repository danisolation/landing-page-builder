import { Module } from '@nestjs/common';
import { PagesController } from './pages.controller';
import { PagesService } from './pages.service';

@Module({
  controllers: [PagesController],  // Đăng ký Controller
  providers: [PagesService],       // Đăng ký Service
})
export class PagesModule {}