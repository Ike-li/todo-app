import { Test, TestingModule } from '@nestjs/testing';

jest.mock('@prisma/client', () => ({
  PrismaClient: class MockPrismaClient {},
}));

import { TagController } from './tag.controller';
import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';

describe('TagController', () => {
  let controller: TagController;
  let service: jest.Mocked<TagService>;

  const mockTag = {
    id: 'tag-1',
    name: 'urgent',
  };

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TagController],
      providers: [{ provide: TagService, useValue: mockService }],
    }).compile();

    controller = module.get<TagController>(TagController);
    service = module.get(TagService);
  });

  describe('POST /tags', () => {
    it('should create a tag and return it', async () => {
      const dto: CreateTagDto = { name: 'new-tag' };
      service.create.mockResolvedValue({ ...mockTag, ...dto });

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result.name).toBe('new-tag');
    });
  });

  describe('GET /tags', () => {
    it('should return all tags', async () => {
      service.findAll.mockResolvedValue([mockTag]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });

  describe('GET /tags/:id', () => {
    it('should return a single tag', async () => {
      service.findOne.mockResolvedValue(mockTag);

      const result = await controller.findOne('tag-1');

      expect(service.findOne).toHaveBeenCalledWith('tag-1');
      expect(result).toEqual(mockTag);
    });
  });

  describe('DELETE /tags/:id', () => {
    it('should remove a tag', async () => {
      service.remove.mockResolvedValue(mockTag);

      const result = await controller.remove('tag-1');

      expect(service.remove).toHaveBeenCalledWith('tag-1');
      expect(result).toEqual(mockTag);
    });
  });
});
