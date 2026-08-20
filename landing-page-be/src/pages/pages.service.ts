import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';

@Injectable()
export class PagesService {
  constructor(private readonly prisma: PrismaService) {}
  // ↑ Inject PrismaService để query database

  async create(dto: CreatePageDto) {
    return this.prisma.page.create({
      data: dto,  // Prisma tự map dto → SQL INSERT
    });
  }

  async findAll() {
    return this.prisma.page.findMany({
      include: { sections: true },  // Lấy luôn sections của mỗi page
    });
  }

  async findOne(id: string) {
    const page = await this.prisma.page.findUnique({
      where: { id },
      include: { sections: true },
    });

    if (!page) {
      throw new NotFoundException(`Page with id "${id}" not found`);
      // Trả lỗi 404 nếu không tìm thấy
    }

    return page;
  }

  async update(id: string, dto: UpdatePageDto) {
    await this.findOne(id); // Kiểm tra tồn tại trước

    return this.prisma.page.update({
      where: { id },
      data: dto,  // Chỉ update field có trong dto
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Kiểm tra tồn tại trước

    return this.prisma.page.delete({
      where: { id },
    });
  }
}