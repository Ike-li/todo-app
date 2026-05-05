import { Test, TestingModule } from '@nestjs/testing';

jest.mock('@prisma/client', () => ({
  PrismaClient: class MockPrismaClient {},
}));

import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

describe('CategoryController', () => {
  let controller: CategoryController;
  let service: jest.Mocked<CategoryService>;

  const userId = 'user-123';

  const mockCategory = {
    id: 'cat-1',
    name: 'Work',
    color: '#ff0000',
    icon: 'briefcase',
    createdAt: new Date('2025-01-01'),
    userId,
  };

  const mockReq = { user: { sub: userId } } as any;

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [{ provide: CategoryService, useValue: mockService }],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
    service = module.get(CategoryService);
  });

  describe('POST /categories', () => {
    it('should create a category and return it', async () => {
      const dto: CreateCategoryDto = {
        name: 'New Category',
        color: '#00ff00',
        icon: 'star',
      };
      service.create.mockResolvedValue({ ...mockCategory, ...dto });

      const result = await controller.create(mockReq, dto);

      expect(service.create).toHaveBeenCalledWith(userId, dto);
      expect(result.name).toBe(dto.name);
    });
  });

  describe('GET /categories', () => {
    it('should return all categories for the user', async () => {
      service.findAll.mockResolvedValue([mockCategory]);

      const result = await controller.findAll(mockReq);

      expect(service.findAll).toHaveBeenCalledWith(userId);
      expect(result).toHaveLength(1);
    });
  });

  describe('GET /categories/:id', () => {
    it('should return a single category', async () => {
      service.findOne.mockResolvedValue(mockCategory);

      const result = await controller.findOne(mockReq, 'cat-1');

      expect(service.findOne).toHaveBeenCalledWith(userId, 'cat-1');
      expect(result).toEqual(mockCategory);
    });
  });

  describe('PATCH /categories/:id', () => {
    it('should update a category', async () => {
      const dto: UpdateCategoryDto = { name: 'Updated' };
      service.update.mockResolvedValue({ ...mockCategory, ...dto });

      const result = await controller.update(mockReq, 'cat-1', dto);

      expect(service.update).toHaveBeenCalledWith(userId, 'cat-1', dto);
      expect(result.name).toBe('Updated');
    });
  });

  describe('DELETE /categories/:id', () => {
    it('should remove a category', async () => {
      service.remove.mockResolvedValue(mockCategory);

      const result = await controller.remove(mockReq, 'cat-1');

      expect(service.remove).toHaveBeenCalledWith(userId, 'cat-1');
      expect(result).toEqual(mockCategory);
    });
  });
});
