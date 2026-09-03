import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PagesService } from './pages.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PagesService', () => {
  let service: PagesService;
  let prisma: {
    page: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  const mockPage = {
    id: 'page-1',
    title: 'Test Page',
    slug: 'test-page',
    description: 'A test page',
    isPublished: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    sections: [],
  };

  beforeEach(async () => {
    prisma = {
      page: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PagesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(PagesService);
  });

  describe('create', () => {
    it('should create a page', async () => {
      prisma.page.create.mockResolvedValue(mockPage);

      const result = await service.create({
        title: 'Test Page',
        slug: 'test-page',
      });

      expect(prisma.page.create).toHaveBeenCalledWith({
        data: { title: 'Test Page', slug: 'test-page' },
      });
      expect(result).toEqual(mockPage);
    });
  });

  describe('findAll', () => {
    it('should return all pages with sections', async () => {
      prisma.page.findMany.mockResolvedValue([mockPage]);

      const result = await service.findAll();

      expect(result).toEqual([mockPage]);
      expect(prisma.page.findMany).toHaveBeenCalledWith({
        include: { sections: { orderBy: { order: 'asc' } } },
      });
    });
  });

  describe('findOne', () => {
    it('should return page by id', async () => {
      prisma.page.findUnique.mockResolvedValue(mockPage);

      const result = await service.findOne('page-1');

      expect(result).toEqual(mockPage);
    });

    it('should throw NotFoundException for non-existent page', async () => {
      prisma.page.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a page', async () => {
      prisma.page.findUnique.mockResolvedValue(mockPage);
      prisma.page.update.mockResolvedValue({
        ...mockPage,
        title: 'Updated',
      });

      const result = await service.update('page-1', { title: 'Updated' });

      expect(prisma.page.update).toHaveBeenCalledWith({
        where: { id: 'page-1' },
        data: { title: 'Updated' },
      });
      expect(result.title).toBe('Updated');
    });

    it('should throw NotFoundException for non-existent page', async () => {
      prisma.page.findUnique.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { title: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a page', async () => {
      prisma.page.findUnique.mockResolvedValue(mockPage);
      prisma.page.delete.mockResolvedValue(mockPage);

      await service.remove('page-1');

      expect(prisma.page.delete).toHaveBeenCalledWith({
        where: { id: 'page-1' },
      });
    });

    it('should throw NotFoundException for non-existent page', async () => {
      prisma.page.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findBySlug', () => {
    it('should return page by slug', async () => {
      prisma.page.findUnique.mockResolvedValue(mockPage);

      const result = await service.findBySlug('test-page');

      expect(result).toEqual(mockPage);
      expect(prisma.page.findUnique).toHaveBeenCalledWith({
        where: { slug: 'test-page', isPublished: true },
        include: { sections: { orderBy: { order: 'asc' } } },
      });
    });

    it('should throw NotFoundException for non-existent slug', async () => {
      prisma.page.findUnique.mockResolvedValue(null);

      await expect(service.findBySlug('nope')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
