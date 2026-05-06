/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { mockDeep } from 'jest-mock-extended';

// Mock PrismaClient before any imports that depend on it
jest.mock('@prisma/client', () => ({
  PrismaClient: class MockPrismaClient {},
}));

import { PrismaService } from '../prisma/prisma.service';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

describe('CategoryService', () => {
  let service: CategoryService;

  let prisma: any;

  const userId = 'user-123';

  const mockCategory = {
    id: 'cat-1',
    name: 'Work',
    color: '#ff0000',
    icon: 'briefcase',
    createdAt: new Date('2025-01-01'),
    userId,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaService>())
      .compile();

    service = module.get<CategoryService>(CategoryService);
    prisma = module.get(PrismaService);
  });

  describe('create', () => {
    it('should create a category associated with the user', async () => {
      const dto: CreateCategoryDto = {
        name: 'Work',
        color: '#ff0000',
        icon: 'briefcase',
      };

      prisma.category.findUnique.mockResolvedValue(null);
      prisma.category.create.mockResolvedValue({ ...mockCategory, ...dto });

      const result = await service.create(userId, dto);

      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: {
          userId_name: {
            userId,
            name: dto.name,
          },
        },
      });
      expect(prisma.category.create).toHaveBeenCalledWith({
        data: {
          ...dto,
          user: { connect: { id: userId } },
        },
      });
      expect(result.name).toBe(dto.name);
      expect(result.color).toBe(dto.color);
    });

    it('should throw ConflictException if category name already exists for user', async () => {
      const dto: CreateCategoryDto = {
        name: 'Work',
      };

      prisma.category.findUnique.mockResolvedValue(mockCategory);

      await expect(service.create(userId, dto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all categories belonging to the user ordered by name', async () => {
      prisma.category.findMany.mockResolvedValue([mockCategory]);

      const result = await service.findAll(userId);

      expect(prisma.category.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { name: 'asc' },
      });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Work');
    });

    it('should return empty array when no categories exist', async () => {
      prisma.category.findMany.mockResolvedValue([]);

      const result = await service.findAll(userId);

      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return a specific category', async () => {
      prisma.category.findUnique.mockResolvedValue(mockCategory);

      const result = await service.findOne(userId, 'cat-1');

      expect(result.id).toBe('cat-1');
      expect(result.name).toBe('Work');
      expect(result.color).toBe('#ff0000');
    });

    it('should throw NotFoundException when category not found', async () => {
      prisma.category.findUnique.mockResolvedValue(null);

      await expect(service.findOne(userId, 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when category belongs to another user', async () => {
      prisma.category.findUnique.mockResolvedValue({
        ...mockCategory,
        userId: 'other-user',
      });

      await expect(service.findOne(userId, 'cat-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    it('should update name, color, and icon', async () => {
      const dto: UpdateCategoryDto = {
        name: 'Updated Work',
        color: '#00ff00',
        icon: 'laptop',
      };

      prisma.category.findUnique.mockResolvedValue(mockCategory);
      prisma.category.update.mockResolvedValue({ ...mockCategory, ...dto });

      const result = await service.update(userId, 'cat-1', dto);

      expect(prisma.category.update).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
        data: dto,
      });
      expect(result.name).toBe(dto.name);
      expect(result.color).toBe(dto.color);
      expect(result.icon).toBe(dto.icon);
    });

    it('should throw ConflictException if new name conflicts with existing category', async () => {
      const dto: UpdateCategoryDto = {
        name: 'Conflicting Name',
      };

      prisma.category.findUnique
        .mockResolvedValueOnce(mockCategory) // findOne call
        .mockResolvedValueOnce({
          ...mockCategory,
          id: 'cat-2',
          name: 'Conflicting Name',
        }); // conflict check

      await expect(service.update(userId, 'cat-1', dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should allow updating to the same name', async () => {
      const dto: UpdateCategoryDto = {
        name: 'Work',
      };

      prisma.category.findUnique
        .mockResolvedValueOnce(mockCategory) // findOne call
        .mockResolvedValueOnce(mockCategory); // same id, no conflict

      prisma.category.update.mockResolvedValue({ ...mockCategory, ...dto });

      const result = await service.update(userId, 'cat-1', dto);

      expect(result.name).toBe('Work');
    });

    it('should update without name and skip conflict check', async () => {
      const dto: UpdateCategoryDto = {
        color: '#00ff00',
        icon: 'laptop',
      };

      prisma.category.findUnique.mockResolvedValueOnce(mockCategory); // findOne call only
      prisma.category.update.mockResolvedValue({ ...mockCategory, ...dto });

      const result = await service.update(userId, 'cat-1', dto);

      expect(prisma.category.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.category.update).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
        data: dto,
      });
      expect(result.color).toBe('#00ff00');
    });
  });

  describe('remove', () => {
    it('should delete the category', async () => {
      prisma.category.findUnique.mockResolvedValue(mockCategory);
      prisma.category.delete.mockResolvedValue(mockCategory);

      const result = await service.remove(userId, 'cat-1');

      expect(prisma.category.delete).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
      });
      expect(result.id).toBe('cat-1');
      expect(result.name).toBe('Work');
    });
  });
});
