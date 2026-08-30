import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

@Injectable()
export class SectionsService {
  private readonly logger = new Logger(SectionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(pageId: string, dto: CreateSectionDto) {
    this.logger.debug(`Creating section for page: ${pageId}`);
    const page = await this.prisma.page.findUnique({
      where: { id: pageId },
    });

    if (!page) {
      this.logger.warn(`Page not found when creating section: ${pageId}`);
      throw new NotFoundException(`Page with id "${pageId}" not found`);
    }

    const section = await this.prisma.section.create({
      data: {
        ...dto,
        pageId,
      },
    });
    this.logger.log(`Section created: ${section.id} (type: ${section.type}, page: ${pageId})`);
    return section;
  }

  async findAll(pageId: string) {
    this.logger.debug(`Fetching all sections for page: ${pageId}`);
    return this.prisma.section.findMany({
      where: { pageId },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(pageId: string, id: string) {
    this.logger.debug(`Fetching section: ${id} from page: ${pageId}`);
    const section = await this.prisma.section.findFirst({
      where: { id, pageId },
    });

    if (!section) {
      this.logger.warn(`Section not found: ${id}`);
      throw new NotFoundException(`Section with id "${id}" not found`);
    }

    return section;
  }

  async update(pageId: string, id: string, dto: UpdateSectionDto) {
    this.logger.debug(`Updating section: ${id}`);
    await this.findOne(pageId, id);

    const section = await this.prisma.section.update({
      where: { id },
      data: dto,
    });
    this.logger.log(`Section updated: ${id}`);
    return section;
  }

  async remove(pageId: string, id: string) {
    this.logger.debug(`Deleting section: ${id}`);
    await this.findOne(pageId, id);

    await this.prisma.section.delete({
      where: { id },
    });
    this.logger.log(`Section deleted: ${id}`);
  }
}
