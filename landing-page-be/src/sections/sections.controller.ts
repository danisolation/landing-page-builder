import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { SectionsService } from './sections.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

@ApiTags('Sections')
@Controller('pages/:pageId/sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Post()
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Create a section', description: 'Appends a new section to the given page. The `type` must be one of the supported section types.' })
  @ApiParam({ name: 'pageId', description: 'Parent page UUID' })
  @ApiResponse({ status: 201, description: 'Section created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Validation error (bad type, missing content, etc.)' })
  create(
    @Param('pageId') pageId: string,
    @Body() dto: CreateSectionDto,
  ) {
    return this.sectionsService.create(pageId, dto);
  }

  @Get()
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'List sections', description: 'Returns all sections of a page, ordered by `order` ascending.' })
  @ApiParam({ name: 'pageId', description: 'Parent page UUID' })
  @ApiResponse({ status: 200, description: 'Array of sections' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Param('pageId') pageId: string) {
    return this.sectionsService.findAll(pageId);
  }

  @Get(':id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get a section', description: 'Returns a single section by its ID.' })
  @ApiParam({ name: 'pageId', description: 'Parent page UUID' })
  @ApiParam({ name: 'id', description: 'Section UUID' })
  @ApiResponse({ status: 200, description: 'Section found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Section not found' })
  findOne(
    @Param('pageId') pageId: string,
    @Param('id') id: string,
  ) {
    return this.sectionsService.findOne(pageId, id);
  }

  @Patch(':id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update a section', description: 'Partially updates a section (type, content, or order).' })
  @ApiParam({ name: 'pageId', description: 'Parent page UUID' })
  @ApiParam({ name: 'id', description: 'Section UUID' })
  @ApiResponse({ status: 200, description: 'Section updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Section not found' })
  update(
    @Param('pageId') pageId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSectionDto,
  ) {
    return this.sectionsService.update(pageId, id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Delete a section', description: 'Removes a section from its page.' })
  @ApiParam({ name: 'pageId', description: 'Parent page UUID' })
  @ApiParam({ name: 'id', description: 'Section UUID' })
  @ApiResponse({ status: 200, description: 'Section deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Section not found' })
  remove(
    @Param('pageId') pageId: string,
    @Param('id') id: string,
  ) {
    return this.sectionsService.remove(pageId, id);
  }
}
