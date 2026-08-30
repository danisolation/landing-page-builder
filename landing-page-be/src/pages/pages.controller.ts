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

@Controller('pages') // All routes start with /pages
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post() // POST /pages — requires auth
  create(@Body() dto: CreatePageDto) {
    return this.pagesService.create(dto);
  }

  @Get() // GET /pages — requires auth
  findAll() {
    return this.pagesService.findAll();
  }

  @Public() // Public for landing page FE
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.pagesService.findBySlug(slug);
  }

  @Get(':id') // GET /pages/:id — requires auth
  findOne(@Param('id') id: string) {
    return this.pagesService.findOne(id);
  }

  @Patch(':id') // PATCH /pages/:id — requires auth
  update(@Param('id') id: string, @Body() dto: UpdatePageDto) {
    return this.pagesService.update(id, dto);
  }

  @Delete(':id') // DELETE /pages/:id — requires auth
  remove(@Param('id') id: string) {
    return this.pagesService.remove(id);
  }
}
