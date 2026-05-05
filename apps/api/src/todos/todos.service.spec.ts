import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

// Mock PrismaClient before any imports that depend on it
jest.mock('@prisma/client', () => ({
  PrismaClient: class MockPrismaClient {},
  Priority: { NONE: 'NONE', LOW: 'LOW', MEDIUM: 'MEDIUM', HIGH: 'HIGH', URGENT: 'URGENT' },
}));

import { PrismaService } from '../prisma/prisma.service';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { QueryTodoDto } from './dto/query-todo.dto';

describe('TodosService', () => {
  let service: TodosService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prisma: any;

  const userId = 'user-123';
  const now = new Date('2025-01-01T00:00:00.000Z');

  const mockTodo = {
    id: 'todo-1',
    title: 'Test Todo',
    description: 'Test Description',
    completed: false,
    priority: 'NONE' as const,
    dueDate: null,
    position: 0,
    createdAt: now,
    updatedAt: now,
    userId,
    parentId: null,
    categoryId: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TodosService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaService>())
      .compile();

    service = module.get<TodosService>(TodosService);
    prisma = module.get(PrismaService);
  });

  describe('create', () => {
    it('should create a todo associated with the user', async () => {
      const dto: CreateTodoDto = {
        title: 'New Todo',
        description: 'New Description',
      };

      prisma.todo.create.mockResolvedValue({ ...mockTodo, ...dto, userId });

      const result = await service.create(userId, dto);

      expect(prisma.todo.create).toHaveBeenCalledWith({
        data: {
          ...dto,
          user: { connect: { id: userId } },
        },
        include: {
          category: true,
          tags: { include: { tag: true } },
        },
      });
      expect(result.title).toBe(dto.title);
      expect(result.description).toBe(dto.description);
    });
  });

  describe('findAll', () => {
    it('should return only todos belonging to the user', async () => {
      const query: QueryTodoDto = new QueryTodoDto();
      prisma.todo.findMany.mockResolvedValue([mockTodo]);
      prisma.todo.count.mockResolvedValue(1);

      const result = await service.findAll(userId, query);

      expect(prisma.todo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId },
        }),
      );
      expect(result.data).toHaveLength(1);
      expect(result.data[0].userId).toBe(userId);
    });

    it('should support pagination', async () => {
      const query = new QueryTodoDto();
      query.page = 2;
      query.limit = 5;

      const todos = Array.from({ length: 5 }, (_, i) => ({
        ...mockTodo,
        id: `todo-${i + 6}`,
      }));

      prisma.todo.findMany.mockResolvedValue(todos);
      prisma.todo.count.mockResolvedValue(15);

      const result = await service.findAll(userId, query);

      expect(prisma.todo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
        }),
      );
      expect(result.data).toHaveLength(5);
      expect(result.total).toBe(15);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(5);
    });

    it('should support completed filter', async () => {
      const query = new QueryTodoDto();
      query.completed = true;

      prisma.todo.findMany.mockResolvedValue([]);
      prisma.todo.count.mockResolvedValue(0);

      await service.findAll(userId, query);

      expect(prisma.todo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId, completed: true },
        }),
      );
    });

    it('should support search filter', async () => {
      const query = new QueryTodoDto();
      query.search = 'keyword';

      prisma.todo.findMany.mockResolvedValue([]);
      prisma.todo.count.mockResolvedValue(0);

      await service.findAll(userId, query);

      expect(prisma.todo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId,
            OR: [
              { title: { contains: 'keyword', mode: 'insensitive' } },
              { description: { contains: 'keyword', mode: 'insensitive' } },
            ],
          },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a specific todo', async () => {
      prisma.todo.findUnique.mockResolvedValue(mockTodo);

      const result = await service.findOne(userId, 'todo-1');

      expect(result).toEqual(mockTodo);
    });

    it('should throw NotFoundException when todo not found', async () => {
      prisma.todo.findUnique.mockResolvedValue(null);

      await expect(service.findOne(userId, 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when todo belongs to another user', async () => {
      prisma.todo.findUnique.mockResolvedValue({
        ...mockTodo,
        userId: 'other-user',
      });

      await expect(service.findOne(userId, 'todo-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    it('should update title and description', async () => {
      const dto: UpdateTodoDto = {
        title: 'Updated Title',
        description: 'Updated Description',
      };

      prisma.todo.findUnique.mockResolvedValue(mockTodo);
      prisma.todo.update.mockResolvedValue({ ...mockTodo, ...dto });

      const result = await service.update(userId, 'todo-1', dto);

      expect(prisma.todo.update).toHaveBeenCalledWith({
        where: { id: 'todo-1' },
        data: dto,
        include: {
          category: true,
          tags: { include: { tag: true } },
        },
      });
      expect(result.title).toBe(dto.title);
    });
  });

  describe('toggle', () => {
    it('should flip the completed status', async () => {
      prisma.todo.findUnique.mockResolvedValue(mockTodo); // completed = false
      prisma.todo.update.mockResolvedValue({ ...mockTodo, completed: true });

      const result = await service.toggle(userId, 'todo-1');

      expect(prisma.todo.update).toHaveBeenCalledWith({
        where: { id: 'todo-1' },
        data: { completed: true },
        include: {
          category: true,
          tags: { include: { tag: true } },
        },
      });
      expect(result.completed).toBe(true);
    });

    it('should flip completed from true to false', async () => {
      prisma.todo.findUnique.mockResolvedValue({
        ...mockTodo,
        completed: true,
      });
      prisma.todo.update.mockResolvedValue({ ...mockTodo, completed: false });

      const result = await service.toggle(userId, 'todo-1');

      expect(prisma.todo.update).toHaveBeenCalledWith({
        where: { id: 'todo-1' },
        data: { completed: false },
        include: {
          category: true,
          tags: { include: { tag: true } },
        },
      });
      expect(result.completed).toBe(false);
    });
  });

  describe('remove', () => {
    it('should delete the todo', async () => {
      prisma.todo.findUnique.mockResolvedValue(mockTodo);
      prisma.todo.delete.mockResolvedValue(mockTodo);

      const result = await service.remove(userId, 'todo-1');

      expect(prisma.todo.delete).toHaveBeenCalledWith({
        where: { id: 'todo-1' },
      });
      expect(result).toEqual(mockTodo);
    });
  });
});
