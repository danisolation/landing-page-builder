import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';

@Injectable()
export class TemplatesService {
  private readonly logger = new Logger(TemplatesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    this.logger.debug('Fetching all templates');
    return this.prisma.template.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    this.logger.debug(`Fetching template: ${id}`);
    const template = await this.prisma.template.findUnique({
      where: { id },
    });

    if (!template) {
      this.logger.warn(`Template not found: ${id}`);
      throw new NotFoundException(`Template with id "${id}" not found`);
    }

    return template;
  }

  async create(dto: CreateTemplateDto) {
    this.logger.debug(`Creating template: ${dto.name}`);
    const template = await this.prisma.template.create({
      data: {
        name: dto.name,
        description: dto.description,
        // sections lưu as-is dạng Json — FE định nghĩa shape
        sections: dto.sections as unknown as Prisma.InputJsonValue,
      },
    });
    this.logger.log(`Template created: ${template.id} — ${template.name}`);
    return template;
  }

  async remove(id: string) {
    this.logger.debug(`Deleting template: ${id}`);
    await this.findOne(id);

    await this.prisma.template.delete({
      where: { id },
    });
    this.logger.log(`Template deleted: ${id}`);
  }
}
