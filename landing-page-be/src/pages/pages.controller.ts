import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { Public } from '../auth/public.decorator';

@ApiTags('Pages')
@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post()
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Create a page', description: 'Creates a new landing page. Optionally seeds initial sections (used when creating from a template).' })
  @ApiResponse({ status: 201, description: 'Page created' })
  @ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required' })
  @ApiResponse({ status: 400, description: 'Validation error (e.g. reserved slug, invalid field)' })
  create(@Body() dto: CreatePageDto) {
    return this.pagesService.create(dto);
  }

  @Get()
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'List all pages', description: 'Returns a summary of every page (no full section content) for the admin dashboard.' })
  @ApiResponse({ status: 200, description: 'Array of page summaries' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll() {
    return this.pagesService.findAll();
  }

  // Must precede @Get(':id') so "sitemap" isn't captured as an id.
  @Public()
  @Get('sitemap')
  @ApiOperation({
    summary: '🌐 List published pages for sitemap.xml',
    description: 'Public endpoint — returns slug + updatedAt for every published page, newest first. Used by the Next.js sitemap generator.',
  })
  @ApiResponse({ status: 200, description: 'Array of { slug, updatedAt } for published pages' })
  findSitemap() {
    return this.pagesService.findSitemap();
  }

  // Public landing-page traffic: shared IPs (CGNAT/office NAT) would hit the
  // 30 req/min global limit and published pages would render as 404s.
  @SkipThrottle()
  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: '🌐 Get a published page by slug', description: 'Public endpoint — returns the full page with all section content for rendering a landing page. Returns 404 if the page is unpublished or missing.' })
  @ApiParam({ name: 'slug', description: 'Page slug', example: 'home' })
  @ApiResponse({ status: 200, description: 'Page found and published' })
  @ApiResponse({ status: 404, description: 'Page not found or not published' })
  findBySlug(@Param('slug') slug: string) {
    return this.pagesService.findBySlug(slug);
  }

  @SkipThrottle()
  @Public()
  @Post(':id/view')
  @ApiOperation({ summary: '🌐 Increment view count', description: 'Public endpoint — records one view of the page. Called from the published landing page.' })
  @ApiParam({ name: 'id', description: 'Page UUID', example: 'adab0860-b643-4abb-98c7-db7421d9aa4d' })
  @ApiResponse({ status: 201, description: 'View recorded' })
  @ApiResponse({ status: 404, description: 'Page not found' })
  incrementView(@Param('id') id: string) {
    return this.pagesService.incrementView(id);
  }

  @Get(':id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get a page by ID', description: 'Returns the full page with all sections ordered for the admin editor.' })
  @ApiParam({ name: 'id', description: 'Page UUID', example: 'adab0860-b643-4abb-98c7-db7421d9aa4d' })
  @ApiResponse({ status: 200, description: 'Page found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Page not found' })
  findOne(@Param('id') id: string) {
    return this.pagesService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update a page', description: 'Partially updates page fields. All fields are optional — only provided fields change.' })
  @ApiParam({ name: 'id', description: 'Page UUID' })
  @ApiResponse({ status: 200, description: 'Page updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Page not found' })
  update(@Param('id') id: string, @Body() dto: UpdatePageDto) {
    return this.pagesService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Delete a page', description: 'Permanently removes the page and all its sections.' })
  @ApiParam({ name: 'id', description: 'Page UUID' })
  @ApiResponse({ status: 200, description: 'Page deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Page not found' })
  remove(@Param('id') id: string) {
    return this.pagesService.remove(id);
  }
}
