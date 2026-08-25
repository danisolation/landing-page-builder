import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { SectionsService } from './sections.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

@Controller('pages/:pageId/sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Post()
  create(
    @Param('pageId') pageId: string,
    @Body() dto: CreateSectionDto,
  ) {
    return this.sectionsService.create(pageId, dto);
  }

  @Get()
  findAll(@Param('pageId') pageId: string) {
    return this.sectionsService.findAll(pageId);
  }

  @Get(':id')
  findOne(
    @Param('pageId') pageId: string,
    @Param('id') id: string,
  ) {
    return this.sectionsService.findOne(pageId, id);
  }

  @Patch(':id')
  update(
    @Param('pageId') pageId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSectionDto,
  ) {
    return this.sectionsService.update(pageId, id, dto);
  }

  @Delete(':id')
  remove(
    @Param('pageId') pageId: string,
    @Param('id') id: string,
  ) {
    return this.sectionsService.remove(pageId, id);
  }
}