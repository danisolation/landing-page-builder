import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';

@Controller('templates') // All routes start with /templates — requires auth (global guard)
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get() // GET /templates
  findAll() {
    return this.templatesService.findAll();
  }

  @Get(':id') // GET /templates/:id
  findOne(@Param('id') id: string) {
    return this.templatesService.findOne(id);
  }

  @Post() // POST /templates — lưu page hiện tại thành template
  create(@Body() dto: CreateTemplateDto) {
    return this.templatesService.create(dto);
  }

  @Delete(':id') // DELETE /templates/:id
  remove(@Param('id') id: string) {
    return this.templatesService.remove(id);
  }
}
