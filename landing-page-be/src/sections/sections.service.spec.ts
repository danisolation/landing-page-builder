import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SectionsService } from './sections.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SectionsService', () => {
  let service: SectionsService;
  let prisma: {
    page: { findUnique: jest.Mock };
    section: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  const mockSection = {
    id: 'section-1',
    type: 'hero',
    content: { heading: 'Hello' },
    order: 0,
    pageId: 'page-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPage = { id: 'page-1', title: 'Test' };

  beforeEach(async () => {
    prisma = {
      page: { findUnique: jest.fn() },
      section: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SectionsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(SectionsService);
  });

  describe('create', () => {
    it('should create a section for a page', async () => {
      prisma.page.findUnique.mockResolvedValue(mockPage);
      prisma.section.create.mockResolvedValue(mockSection);

      const result = await service.create('page-1', {
        type: 'hero',
        content: { heading: 'Hello' },
        order: 0,
      });

      expect(prisma.section.create).toHaveBeenCalledWith({
        data: {
          type: 'hero',
          content: { heading: 'Hello' },
          order: 0,
          pageId: 'page-1',
        },
      });
      expect(result).toEqual(mockSection);
    });

    it('should throw NotFoundException for non-existent page', async () => {
      prisma.page.findUnique.mockResolvedValue(null);

      await expect(
        service.create('nonexistent', {
          type: 'hero',
          content: {},
          order: 0,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all sections for a page', async () => {
      prisma.section.findMany.mockResolvedValue([mockSection]);

      const result = await service.findAll('page-1');

      expect(result).toEqual([mockSection]);
      expect(prisma.section.findMany).toHaveBeenCalledWith({
        where: { pageId: 'page-1' },
        orderBy: { order: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return section by id and pageId', async () => {
      prisma.section.findFirst.mockResolvedValue(mockSection);

      const result = await service.findOne('page-1', 'section-1');

      expect(result).toEqual(mockSection);
    });

    it('should throw NotFoundException for non-existent section', async () => {
      prisma.section.findFirst.mockResolvedValue(null);

      await expect(
        service.findOne('page-1', 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a section', async () => {
      prisma.section.findFirst.mockResolvedValue(mockSection);
      prisma.section.update.mockResolvedValue({
        ...mockSection,
        order: 1,
      });

      const result = await service.update('page-1', 'section-1', { order: 1 });

      expect(prisma.section.update).toHaveBeenCalledWith({
        where: { id: 'section-1' },
        data: { order: 1 },
      });
      expect(result.order).toBe(1);
    });

    it('should throw NotFoundException for non-existent section', async () => {
      prisma.section.findFirst.mockResolvedValue(null);

      await expect(
        service.update('page-1', 'nonexistent', { order: 1 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a section', async () => {
      prisma.section.findFirst.mockResolvedValue(mockSection);
      prisma.section.delete.mockResolvedValue(mockSection);

      await service.remove('page-1', 'section-1');

      expect(prisma.section.delete).toHaveBeenCalledWith({
        where: { id: 'section-1' },
      });
    });

    it('should throw NotFoundException for non-existent section', async () => {
      prisma.section.findFirst.mockResolvedValue(null);

      await expect(
        service.remove('page-1', 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
