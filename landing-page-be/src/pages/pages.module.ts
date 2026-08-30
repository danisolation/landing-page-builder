import { Module } from '@nestjs/common';
import { PagesController } from './pages.controller';
import { PagesService } from './pages.service';

@Module({
  controllers: [PagesController],  // Register Controller
  providers: [PagesService],       // Register Service
})
export class PagesModule {}
