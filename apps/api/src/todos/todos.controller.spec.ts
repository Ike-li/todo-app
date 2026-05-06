/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';

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

import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { QueryTodoDto } from './dto/query-todo.dto';

describe('TodosController', () => {
  let controller: TodosController;
  let service: jest.Mocked<TodosService>;

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

  const mockReq = { user: { sub: userId } } as any;

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      toggle: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodosController],
      providers: [{ provide: TodosService, useValue: mockService }],
    }).compile();

    controller = module.get<TodosController>(TodosController);
    service = module.get(TodosService);
  });

  describe('POST /todos', () => {
    it('should create a todo and return 201', async () => {
      const dto: CreateTodoDto = {
        title: 'New Todo',
        description: 'Description',
      };
      service.create.mockResolvedValue({ ...mockTodo, ...dto } as any);

      const result = await controller.create(mockReq, dto);

      expect(service.create).toHaveBeenCalledWith(userId, dto);
      expect(result.title).toBe(dto.title);
    });
  });

  describe('GET /todos', () => {
    it('should return paginated todos', async () => {
      const query = new QueryTodoDto();
      const paginated = {
        data: [mockTodo],
        total: 1,
        page: 1,
        limit: 20,
      };
      service.findAll.mockResolvedValue(paginated);

      const result = await controller.findAll(mockReq, query);

      expect(service.findAll).toHaveBeenCalledWith(userId, query);
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('GET /todos/:id', () => {
    it('should return a single todo', async () => {
      service.findOne.mockResolvedValue(mockTodo);

      const result = await controller.findOne(mockReq, 'todo-1');

      expect(service.findOne).toHaveBeenCalledWith(userId, 'todo-1');
      expect(result).toEqual(mockTodo);
    });
  });

  describe('PATCH /todos/:id', () => {
    it('should update a todo', async () => {
      const dto: UpdateTodoDto = { title: 'Updated' };
      service.update.mockResolvedValue({ ...mockTodo, ...dto } as any);

      const result = await controller.update(mockReq, 'todo-1', dto);

      expect(service.update).toHaveBeenCalledWith(userId, 'todo-1', dto);
      expect(result.title).toBe('Updated');
    });
  });

  describe('DELETE /todos/:id', () => {
    it('should remove a todo', async () => {
      service.remove.mockResolvedValue(mockTodo);

      const result = await controller.remove(mockReq, 'todo-1');

      expect(service.remove).toHaveBeenCalledWith(userId, 'todo-1');
      expect(result).toEqual({ message: 'Todo deleted successfully' });
    });
  });

  describe('PATCH /todos/:id/toggle', () => {
    it('should toggle the completed status', async () => {
      service.toggle.mockResolvedValue({ ...mockTodo, completed: true });

      const result = await controller.toggle(mockReq, 'todo-1');

      expect(service.toggle).toHaveBeenCalledWith(userId, 'todo-1');
      expect(result.completed).toBe(true);
    });
  });
});
