import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Prisma, Todo } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { QueryTodoDto } from './dto/query-todo.dto';
import { ReorderTodosDto } from './dto/reorder-todo.dto';
import { TodoResponseDto } from './dto/response-todo.dto';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class TodosService {
  constructor(private prisma: PrismaService) {}

  private toResponseDto(todo: Todo): TodoResponseDto {
    return plainToInstance(TodoResponseDto, todo);
  }

  async create(userId: string, dto: CreateTodoDto): Promise<TodoResponseDto> {
    const { tags, dueDate, categoryId, parentId, ...rest } = dto;

    const todo = await this.prisma.todo.create({
      data: {
        ...rest,
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(categoryId !== undefined && {
          category: { connect: { id: categoryId } },
        }),
        ...(parentId && { parent: { connect: { id: parentId } } }),
        user: { connect: { id: userId } },
        ...(tags &&
          tags.length > 0 && {
            tags: {
              create: await this.resolveTagIds(tags),
            },
          }),
      },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    });

    return this.toResponseDto(todo);
  }

  async findAll(
    userId: string,
    query: QueryTodoDto,
  ): Promise<PaginatedResult<TodoResponseDto>> {
    const { page, limit, completed, search, sort, order } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.TodoWhereInput = {
      userId,
      ...(completed !== undefined && { completed }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const include = {
      category: true,
      tags: { include: { tag: true } },
      subTasks: {
        include: {
          category: true,
          tags: { include: { tag: true } },
        },
      },
    };

    const [data, total] = await Promise.all([
      this.prisma.todo.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        include,
      }),
      this.prisma.todo.count({ where }),
    ]);

    return {
      data: data.map((todo) => this.toResponseDto(todo)),
      total,
      page,
      limit,
    };
  }

  async findOne(userId: string, id: string): Promise<TodoResponseDto> {
    const todo = await this.prisma.todo.findUnique({
      where: { id },
      include: {
        category: true,
        tags: { include: { tag: true } },
        subTasks: {
          include: {
            category: true,
            tags: { include: { tag: true } },
          },
        },
      },
    });

    if (!todo) {
      throw new NotFoundException(`Todo with id "${id}" not found`);
    }

    if (todo.userId !== userId) {
      throw new ForbiddenException('You do not have access to this todo');
    }

    return this.toResponseDto(todo);
  }

  async getSubTasks(
    userId: string,
    parentId: string,
  ): Promise<TodoResponseDto[]> {
    // Verify parent exists and belongs to the user
    await this.findOne(userId, parentId);

    const todos = await this.prisma.todo.findMany({
      where: { parentId },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
      orderBy: { position: 'asc' },
    });

    return todos.map((todo) => this.toResponseDto(todo));
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateTodoDto,
  ): Promise<TodoResponseDto> {
    await this.findOne(userId, id);

    const { tags, dueDate, categoryId, parentId, ...rest } = dto;

    // Prevent self-referencing parent
    if (parentId !== undefined && parentId === id) {
      throw new ForbiddenException('A todo cannot be its own parent');
    }

    // If tags are provided, replace all existing tags
    if (tags !== undefined) {
      // Delete existing tag relations
      await this.prisma.tagsOnTodos.deleteMany({
        where: { todoId: id },
      });
    }

    const todo = await this.prisma.todo.update({
      where: { id },
      data: {
        ...rest,
        ...(dueDate !== undefined && {
          dueDate: dueDate ? new Date(dueDate) : null,
        }),
        ...(categoryId !== undefined && {
          category: categoryId
            ? { connect: { id: categoryId } }
            : { disconnect: true },
        }),
        ...(parentId !== undefined && {
          parent: parentId
            ? { connect: { id: parentId } }
            : { disconnect: true },
        }),
        ...(tags &&
          tags.length > 0 && {
            tags: {
              create: await this.resolveTagIds(tags),
            },
          }),
      },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    });

    return this.toResponseDto(todo);
  }

  async toggle(userId: string, id: string): Promise<TodoResponseDto> {
    // Permission check only (don't use the completed value for the update)
    await this.findOne(userId, id);

    // Atomic toggle using raw SQL to prevent race conditions
    await this.prisma.$executeRaw`
      UPDATE todos SET completed = NOT completed, updated_at = NOW()
      WHERE id = ${id} AND user_id = ${userId}
    `;

    // Fetch the updated result with relations
    const updated = await this.prisma.todo.findUnique({
      where: { id },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    });

    return this.toResponseDto(updated!);
  }

  async remove(userId: string, id: string): Promise<Todo> {
    await this.findOne(userId, id);

    return this.prisma.todo.delete({
      where: { id },
    });
  }

  async reorder(
    userId: string,
    dto: ReorderTodosDto,
  ): Promise<TodoResponseDto[]> {
    // Validate all items exist and belong to the user
    const ids = dto.items.map((item) => item.id);
    const todos = await this.prisma.todo.findMany({
      where: { id: { in: ids }, userId },
    });

    if (todos.length !== ids.length) {
      const foundIds = new Set(todos.map((t) => t.id));
      const missingIds = ids.filter((id) => !foundIds.has(id));
      throw new NotFoundException(
        `Todos not found or not accessible: ${missingIds.join(', ')}`,
      );
    }

    const updatePromises = dto.items.map((item) =>
      this.prisma.todo.update({
        where: { id: item.id },
        data: { position: item.position },
      }),
    );

    const updated = await this.prisma.$transaction(updatePromises);
    return updated.map((todo) => this.toResponseDto(todo));
  }

  /**
   * Resolves tag names to tag IDs, creating tags that don't exist yet.
   */
  private async resolveTagIds(
    tagNames: string[],
  ): Promise<{ tag: { connect: { id: string } } }[]> {
    const result: { tag: { connect: { id: string } } }[] = [];

    for (const name of tagNames) {
      const normalizedName = name.trim().toLowerCase();
      if (!normalizedName) continue;

      const tag = await this.prisma.tag.upsert({
        where: { name: normalizedName },
        update: {},
        create: { name: normalizedName },
      });

      result.push({ tag: { connect: { id: tag.id } } });
    }

    return result;
  }
}
