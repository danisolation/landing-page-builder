import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

@Injectable()
export class SectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(pageId: string, dto: CreateSectionDto) {
    // Kiểm tra page có tồn tại không
    const page = await this.prisma.page.findUnique({
      where: { id: pageId },
    });

    if (!page) {
      throw new NotFoundException(`Page with id "${pageId}" not found`);
    }

    return this.prisma.section.create({
      data: {
        ...dto,
        pageId,  // Gán section vào page
      },
    });
  }

  async findAll(pageId: string) {
    return this.prisma.section.findMany({
      where: { pageId },
      orderBy: { order: 'asc' },  // Sắp xếp theo thứ tự
    });
  }

  async findOne(pageId: string, id: string) {
    const section = await this.prisma.section.findFirst({
      where: { id, pageId },  // Đảm bảo section thuộc page đúng
    });

    if (!section) {
      throw new NotFoundException(`Section with id "${id}" not found`);
    }

    return section;
  }

  async update(pageId: string, id: string, dto: UpdateSectionDto) {
    await this.findOne(pageId, id); // Kiểm tra tồn tại

    return this.prisma.section.update({
      where: { id },
      data: dto,
    });
  }

  async remove(pageId: string, id: string) {
    await this.findOne(pageId, id); // Kiểm tra tồn tại

    return this.prisma.section.delete({
      where: { id },
    });
  }
}