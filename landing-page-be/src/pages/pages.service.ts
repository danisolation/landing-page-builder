import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';

@Injectable()
export class PagesService {
  private readonly logger = new Logger(PagesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePageDto) {
    this.logger.log(`Creating page: ${dto.title}`);
    return this.prisma.page.create({
      data: dto,
    });
  }

  async findAll() {
    this.logger.log('Fetching all pages');
    return this.prisma.page.findMany({
      include: { sections: { orderBy: { order: 'asc' } } },
    });
  }

  async findOne(id: string) {
    this.logger.log(`Fetching page: ${id}`);
    const page = await this.prisma.page.findUnique({
      where: { id },
      include: { sections: { orderBy: { order: 'asc' } } },
    });

    if (!page) {
      throw new NotFoundException(`Page with id "${id}" not found`);
    }

    return page;
  }

  async update(id: string, dto: UpdatePageDto) {
    this.logger.log(`Updating page: ${id}`);
    await this.findOne(id);

    return this.prisma.page.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    this.logger.log(`Deleting page: ${id}`);
    await this.findOne(id);

    return this.prisma.page.delete({
      where: { id },
    });
  }

  async findBySlug(slug: string) {
    this.logger.log(`Fetching page by slug: ${slug}`);
    const page = await this.prisma.page.findUnique({
      where: { slug },
      include: { sections: { orderBy: { order: 'asc' } } },
    });

    if (!page) {
      throw new NotFoundException(`Page with slug "${slug}" not found`);
    }

    return page;
  }
}
