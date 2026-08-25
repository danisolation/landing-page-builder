import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PagesModule } from './pages/pages.module';
import { SectionsModule } from './sections/sections.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),  // Load .env
    PrismaModule,
    PagesModule,
    SectionsModule,
  ],
   controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}