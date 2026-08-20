import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';

@Controller('pages')  // Mọi route bắt đầu bằng /pages
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post()  // POST /pages
  create(@Body() dto: CreatePageDto) {
    return this.pagesService.create(dto);
  }

  @Get()  // GET /pages
  findAll() {
    return this.pagesService.findAll();
  }

  @Get(':id')  // GET /pages/abc-123
  findOne(@Param('id') id: string) {
    return this.pagesService.findOne(id);
  }

  @Patch(':id')  // PATCH /pages/abc-123
  update(@Param('id') id: string, @Body() dto: UpdatePageDto) {
    return this.pagesService.update(id, dto);
  }

  @Delete(':id')  // DELETE /pages/abc-123
  remove(@Param('id') id: string) {
    return this.pagesService.remove(id);
  }
}