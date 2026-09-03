import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TemplatesService', () => {
  let service: TemplatesService;
  let prisma: {
    template: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      delete: jest.Mock;
    };
  };

  const mockSections = [
    { type: 'hero', content: { heading: 'Hi' }, order: 0 },
  ];

  const mockTemplate = {
    id: 'template-1',
    name: 'Test Template',
    description: 'A test template',
    sections: mockSections,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      template: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemplatesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(TemplatesService);
  });

  describe('create', () => {
    it('should create a template', async () => {
      prisma.template.create.mockResolvedValue(mockTemplate);

      const result = await service.create({
        name: 'Test Template',
        description: 'A test template',
        sections: mockSections,
      });

      expect(prisma.template.create).toHaveBeenCalledWith({
        data: {
          name: 'Test Template',
          description: 'A test template',
          sections: mockSections,
        },
      });
      expect(result).toEqual(mockTemplate);
    });
  });

  describe('findAll', () => {
    it('should return all templates ordered by newest first', async () => {
      prisma.template.findMany.mockResolvedValue([mockTemplate]);

      const result = await service.findAll();

      expect(result).toEqual([mockTemplate]);
      expect(prisma.template.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return template by id', async () => {
      prisma.template.findUnique.mockResolvedValue(mockTemplate);

      const result = await service.findOne('template-1');

      expect(result).toEqual(mockTemplate);
    });

    it('should throw NotFoundException for non-existent template', async () => {
      prisma.template.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete template', async () => {
      prisma.template.findUnique.mockResolvedValue(mockTemplate);
      prisma.template.delete.mockResolvedValue(mockTemplate);

      await service.remove('template-1');

      expect(prisma.template.delete).toHaveBeenCalledWith({
        where: { id: 'template-1' },
      });
    });

    it('should throw NotFoundException for non-existent template', async () => {
      prisma.template.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
