import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';

@Injectable()
export class PagesService {
  private readonly logger = new Logger(PagesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePageDto) {
    this.logger.debug(`Creating page: ${dto.title}`);
    const { sections, globalStyle, ...pageData } = dto;
    // Nested write — page + sections tạo trong cùng 1 query (atomic)
    const page = await this.prisma.page.create({
      data: {
        ...pageData,
        ...(globalStyle
          ? { globalStyle: globalStyle as Prisma.InputJsonValue }
          : {}),
        ...(sections?.length
          ? {
              sections: {
                create: sections.map((s) => ({
                  type: s.type,
                  content: s.content,
                  order: s.order,
                })),
              },
            }
          : {}),
      },
      include: { sections: { orderBy: { order: 'asc' } } },
    });
    this.logger.log(
      `Page created: ${page.id} — ${page.title} (${page.sections.length} sections)`,
    );
    return page;
  }

  async findAll() {
    this.logger.debug('Fetching all pages');
    return this.prisma.page.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        isPublished: true,
        viewCount: true,
        updatedAt: true,
        sections: { orderBy: { order: 'asc' }, select: { id: true, type: true, order: true } },
      },
    });
  }

  async findOne(id: string) {
    this.logger.debug(`Fetching page: ${id}`);
    const page = await this.prisma.page.findUnique({
      where: { id },
      include: { sections: { orderBy: { order: 'asc' } } },
    });

    if (!page) {
      this.logger.warn(`Page not found: ${id}`);
      throw new NotFoundException(`Page with id "${id}" not found`);
    }

    return page;
  }

  async update(id: string, dto: UpdatePageDto) {
    this.logger.debug(`Updating page: ${id}`);

    const { globalStyle, ...rest } = dto;
    const page = await this.prisma.page.update({
      where: { id },
      data: {
        ...rest,
        ...(globalStyle !== undefined
          ? { globalStyle: globalStyle as Prisma.InputJsonValue }
          : {}),
      },
    });
    this.logger.log(`Page updated: ${id}`);
    return page;
  }

  async remove(id: string) {
    this.logger.debug(`Deleting page: ${id}`);

    await this.prisma.page.delete({
      where: { id },
    });
    this.logger.log(`Page deleted: ${id}`);
  }

  async findBySlug(slug: string) {
    this.logger.debug(`Fetching published page by slug: ${slug}`);
    const page = await this.prisma.page.findUnique({
      where: { slug, isPublished: true },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        metaTitle: true,
        metaDescription: true,
        ogImageUrl: true,
        keywords: true,
        canonicalUrl: true,
        globalStyle: true,
        sections: {
          orderBy: { order: 'asc' },
          select: { id: true, type: true, content: true, order: true },
        },
      },
    });

    if (!page) {
      this.logger.warn(`Published page not found by slug: ${slug}`);
      throw new NotFoundException(`Page with slug "${slug}" not found`);
    }

    return page;
  }

  async incrementView(id: string) {
    await this.prisma.page.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
      select: { id: true, viewCount: true },
    });
    return { ok: true };
  }
}
