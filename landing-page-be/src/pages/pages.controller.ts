import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { Public } from '../auth/public.decorator';

@Controller('pages') // Mọi route bắt đầu bằng /pages
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post() // POST /pages — cần token
  create(@Body() dto: CreatePageDto) {
    return this.pagesService.create(dto);
  }

  @Get() // GET /pages — cần token
  findAll() {
    return this.pagesService.findAll();
  }

  @Public() // Public cho landing page FE
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.pagesService.findBySlug(slug);
  }

  @Get(':id') // GET /pages/abc-123 — cần token
  findOne(@Param('id') id: string) {
    return this.pagesService.findOne(id);
  }

  @Patch(':id') // PATCH /pages/abc-123 — cần token
  update(@Param('id') id: string, @Body() dto: UpdatePageDto) {
    return this.pagesService.update(id, dto);
  }

  @Delete(':id') // DELETE /pages/abc-123 — cần token
  remove(@Param('id') id: string) {
    return this.pagesService.remove(id);
  }
}
