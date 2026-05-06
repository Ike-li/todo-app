/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { mockDeep } from 'jest-mock-extended';

// Mock PrismaClient before any imports that depend on it
jest.mock('@prisma/client', () => ({
  PrismaClient: class MockPrismaClient {},
  Priority: {
    NONE: 'NONE',
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    URGENT: 'URGENT',
  },
}));

import { PrismaService } from '../prisma/prisma.service';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { QueryTodoDto } from './dto/query-todo.dto';
import { ReorderTodosDto } from './dto/reorder-todo.dto';

describe('TodosService', () => {
  let service: TodosService;

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

    it('should create a todo with tags', async () => {
      const dto: CreateTodoDto = {
        title: 'Tagged Todo',
        tags: ['work', 'urgent'],
      };

      prisma.tag.upsert
        .mockResolvedValueOnce({ id: 'tag-1', name: 'work' })
        .mockResolvedValueOnce({ id: 'tag-2', name: 'urgent' });
      prisma.todo.create.mockResolvedValue({ ...mockTodo, ...dto });

      const result = await service.create(userId, dto);

      expect(prisma.tag.upsert).toHaveBeenCalledTimes(2);
      expect(prisma.todo.create).toHaveBeenCalled();
    });

    it('should skip empty tag names', async () => {
      const dto: CreateTodoDto = {
        title: 'Tagged Todo',
        tags: ['work', '', '  '],
      };

      prisma.tag.upsert.mockResolvedValue({ id: 'tag-1', name: 'work' });
      prisma.todo.create.mockResolvedValue({ ...mockTodo, ...dto });

      await service.create(userId, dto);

      expect(prisma.tag.upsert).toHaveBeenCalledTimes(1);
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

    it('should replace tags on update', async () => {
      const dto: UpdateTodoDto = { tags: ['new-tag'] };

      prisma.todo.findUnique.mockResolvedValue(mockTodo);
      prisma.tagsOnTodos.deleteMany.mockResolvedValue({ count: 1 });
      prisma.tag.upsert.mockResolvedValue({ id: 'tag-new', name: 'new-tag' });
      prisma.todo.update.mockResolvedValue(mockTodo);

      await service.update(userId, 'todo-1', dto);

      expect(prisma.tagsOnTodos.deleteMany).toHaveBeenCalledWith({
        where: { todoId: 'todo-1' },
      });
      expect(prisma.tag.upsert).toHaveBeenCalled();
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

  describe('getSubTasks', () => {
    it('should return sub-tasks for a parent todo', async () => {
      const subTasks = [
        { ...mockTodo, id: 'sub-1', parentId: 'todo-1' },
        { ...mockTodo, id: 'sub-2', parentId: 'todo-1' },
      ];

      prisma.todo.findUnique.mockResolvedValue(mockTodo);
      prisma.todo.findMany.mockResolvedValue(subTasks);

      const result = await service.getSubTasks(userId, 'todo-1');

      expect(prisma.todo.findUnique).toHaveBeenCalled();
      expect(prisma.todo.findMany).toHaveBeenCalledWith({
        where: { parentId: 'todo-1' },
        include: {
          category: true,
          tags: { include: { tag: true } },
        },
        orderBy: { position: 'asc' },
      });
      expect(result).toHaveLength(2);
    });

    it('should throw if parent todo not found', async () => {
      prisma.todo.findUnique.mockResolvedValue(null);

      await expect(
        service.getSubTasks(userId, 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('reorder', () => {
    it('should update positions in a transaction', async () => {
      const dto: ReorderTodosDto = {
        items: [
          { id: 'todo-1', position: 0 },
          { id: 'todo-2', position: 1 },
        ],
      };

      const updatedTodos = [
        { ...mockTodo, id: 'todo-1', position: 0 },
        { ...mockTodo, id: 'todo-2', position: 1 },
      ];

      prisma.todo.update
        .mockResolvedValueOnce(updatedTodos[0])
        .mockResolvedValueOnce(updatedTodos[1]);
      prisma.$transaction.mockImplementation((promises: Promise<unknown>[]) =>
        Promise.all(promises),
      );

      const result = await service.reorder(userId, dto);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.todo.update).toHaveBeenCalledWith({
        where: { id: 'todo-1', userId },
        data: { position: 0 },
      });
      expect(prisma.todo.update).toHaveBeenCalledWith({
        where: { id: 'todo-2', userId },
        data: { position: 1 },
      });
      expect(result).toHaveLength(2);
    });
  });
});
