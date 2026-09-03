import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';

@Injectable()
export class PagesService {
  private readonly logger = new Logger(PagesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePageDto) {
    this.logger.debug(`Creating page: ${dto.title}`);
    const { sections, ...pageData } = dto;
    // Nested write — page + sections tạo trong cùng 1 query (atomic)
    const page = await this.prisma.page.create({
      data: {
        ...pageData,
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
      include: { sections: { orderBy: { order: 'asc' } } },
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
    await this.findOne(id);

    const page = await this.prisma.page.update({
      where: { id },
      data: dto,
    });
    this.logger.log(`Page updated: ${id}`);
    return page;
  }

  async remove(id: string) {
    this.logger.debug(`Deleting page: ${id}`);
    await this.findOne(id);

    await this.prisma.page.delete({
      where: { id },
    });
    this.logger.log(`Page deleted: ${id}`);
  }

  async findBySlug(slug: string) {
    this.logger.debug(`Fetching published page by slug: ${slug}`);
    const page = await this.prisma.page.findUnique({
      where: { slug, isPublished: true },
      include: { sections: { orderBy: { order: 'asc' } } },
    });

    if (!page) {
      this.logger.warn(`Published page not found by slug: ${slug}`);
      throw new NotFoundException(`Page with slug "${slug}" not found`);
    }

    return page;
  }
}
