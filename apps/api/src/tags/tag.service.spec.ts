import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

// Mock PrismaClient before any imports that depend on it
jest.mock('@prisma/client', () => ({
  PrismaClient: class MockPrismaClient {},
}));

import { PrismaService } from '../prisma/prisma.service';
import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';

describe('TagService', () => {
  let service: TagService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prisma: any;

  const mockTag = {
    id: 'tag-1',
    name: 'urgent',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TagService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaService>())
      .compile();

    service = module.get<TagService>(TagService);
    prisma = module.get(PrismaService);
  });

  describe('create', () => {
    it('should create a tag with normalized lowercase name', async () => {
      const dto: CreateTagDto = {
        name: '  Urgent  ',
      };

      prisma.tag.findUnique.mockResolvedValue(null);
      prisma.tag.create.mockResolvedValue({ ...mockTag, name: 'urgent' });

      const result = await service.create(dto);

      expect(prisma.tag.findUnique).toHaveBeenCalledWith({
        where: { name: 'urgent' },
      });
      expect(prisma.tag.create).toHaveBeenCalledWith({
        data: { name: 'urgent' },
      });
      expect(result.name).toBe('urgent');
    });

    it('should throw ConflictException if tag already exists', async () => {
      const dto: CreateTagDto = {
        name: 'urgent',
      };

      prisma.tag.findUnique.mockResolvedValue(mockTag);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all tags ordered by name', async () => {
      prisma.tag.findMany.mockResolvedValue([mockTag]);

      const result = await service.findAll();

      expect(prisma.tag.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      });
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no tags exist', async () => {
      prisma.tag.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return a specific tag', async () => {
      prisma.tag.findUnique.mockResolvedValue(mockTag);

      const result = await service.findOne('tag-1');

      expect(result).toEqual(mockTag);
    });

    it('should throw NotFoundException when tag not found', async () => {
      prisma.tag.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete the tag', async () => {
      prisma.tag.findUnique.mockResolvedValue(mockTag);
      prisma.tag.delete.mockResolvedValue(mockTag);

      const result = await service.remove('tag-1');

      expect(prisma.tag.delete).toHaveBeenCalledWith({
        where: { id: 'tag-1' },
      });
      expect(result).toEqual(mockTag);
    });

    it('should throw NotFoundException when tag not found', async () => {
      prisma.tag.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
