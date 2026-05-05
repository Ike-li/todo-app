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
    return this.prisma.todo.create({
      data: {
        ...dto,
        user: { connect: { id: userId } },
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

    const [data, total] = await Promise.all([
      this.prisma.todo.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
      }),
      this.prisma.todo.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(userId: string, id: string): Promise<Todo> {
    const todo = await this.prisma.todo.findUnique({
      where: { id },
    });

    if (!todo) {
      throw new NotFoundException(`Todo with id "${id}" not found`);
    }

    if (todo.userId !== userId) {
      throw new ForbiddenException('You do not have access to this todo');
    }

    return todo;
  }

  async update(userId: string, id: string, dto: UpdateTodoDto): Promise<Todo> {
    await this.findOne(userId, id);

    return this.prisma.todo.update({
      where: { id },
      data: dto,
    });
  }

  async toggle(userId: string, id: string): Promise<Todo> {
    const todo = await this.findOne(userId, id);

    return this.prisma.todo.update({
      where: { id },
      data: { completed: !todo.completed },
    });
  }

  async remove(userId: string, id: string): Promise<Todo> {
    await this.findOne(userId, id);

    return this.prisma.todo.delete({
      where: { id },
    });
  }
}
