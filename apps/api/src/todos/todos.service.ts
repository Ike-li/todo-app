import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Prisma, Todo } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { QueryTodoDto } from './dto/query-todo.dto';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class TodosService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateTodoDto): Promise<Todo> {
    const { tags, dueDate, categoryId, parentId, ...rest } = dto;

    return this.prisma.todo.create({
      data: {
        ...rest,
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(categoryId !== undefined && { category: { connect: { id: categoryId } } }),
        ...(parentId && { parent: { connect: { id: parentId } } }),
        user: { connect: { id: userId } },
        ...(tags && tags.length > 0 && {
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
  }

  async findAll(
    userId: string,
    query: QueryTodoDto,
  ): Promise<PaginatedResult<Todo>> {
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

    return { data, total, page, limit };
  }

  async findOne(userId: string, id: string): Promise<Todo> {
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

    return todo;
  }

  async getSubTasks(userId: string, parentId: string): Promise<Todo[]> {
    // Verify parent exists and belongs to the user
    await this.findOne(userId, parentId);

    return this.prisma.todo.findMany({
      where: { parentId },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
      orderBy: { position: 'asc' },
    });
  }

  async update(userId: string, id: string, dto: UpdateTodoDto): Promise<Todo> {
    await this.findOne(userId, id);

    const { tags, dueDate, categoryId, parentId, ...rest } = dto;

    // If tags are provided, replace all existing tags
    if (tags !== undefined) {
      // Delete existing tag relations
      await this.prisma.tagsOnTodos.deleteMany({
        where: { todoId: id },
      });
    }

    return this.prisma.todo.update({
      where: { id },
      data: {
        ...rest,
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
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
        ...(tags && tags.length > 0 && {
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
  }

  async toggle(userId: string, id: string): Promise<Todo> {
    const todo = await this.findOne(userId, id);

    return this.prisma.todo.update({
      where: { id },
      data: { completed: !todo.completed },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    });
  }

  async remove(userId: string, id: string): Promise<Todo> {
    await this.findOne(userId, id);

    return this.prisma.todo.delete({
      where: { id },
    });
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
