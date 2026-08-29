import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

@Injectable()
export class SectionsService {
  private readonly logger = new Logger(SectionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(pageId: string, dto: CreateSectionDto) {
    this.logger.log(`Creating section for page: ${pageId}`);
    const page = await this.prisma.page.findUnique({
      where: { id: pageId },
    });

    if (!page) {
      throw new NotFoundException(`Page with id "${pageId}" not found`);
    }

    return this.prisma.section.create({
      data: {
        ...dto,
        pageId,
      },
    });
  }

  async findAll(pageId: string) {
    this.logger.log(`Fetching all sections for page: ${pageId}`);
    return this.prisma.section.findMany({
      where: { pageId },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(pageId: string, id: string) {
    this.logger.log(`Fetching section: ${id} from page: ${pageId}`);
    const section = await this.prisma.section.findFirst({
      where: { id, pageId },
    });

    if (!section) {
      throw new NotFoundException(`Section with id "${id}" not found`);
    }

    return section;
  }

  async update(pageId: string, id: string, dto: UpdateSectionDto) {
    this.logger.log(`Updating section: ${id}`);
    await this.findOne(pageId, id);

    return this.prisma.section.update({
      where: { id },
      data: dto,
    });
  }

  async remove(pageId: string, id: string) {
    this.logger.log(`Deleting section: ${id}`);
    await this.findOne(pageId, id);

    return this.prisma.section.delete({
      where: { id },
    });
  }
}