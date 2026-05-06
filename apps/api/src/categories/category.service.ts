import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Category } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/response-category.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  private toResponseDto(category: Category): CategoryResponseDto {
    return plainToInstance(CategoryResponseDto, category);
  }

  async create(
    userId: string,
    dto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const existing = await this.prisma.category.findUnique({
      where: {
        userId_name: {
          userId,
          name: dto.name,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Category with name "${dto.name}" already exists`,
      );
    }

    const category = await this.prisma.category.create({
      data: {
        ...dto,
        user: { connect: { id: userId } },
      },
    });

    return this.toResponseDto(category);
  }

  async findAll(userId: string): Promise<CategoryResponseDto[]> {
    const categories = await this.prisma.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });

    return categories.map((cat) => this.toResponseDto(cat));
  }

  async findOne(userId: string, id: string): Promise<CategoryResponseDto> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category with id "${id}" not found`);
    }

    if (category.userId !== userId) {
      throw new ForbiddenException('You do not have access to this category');
    }

    return this.toResponseDto(category);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    await this.findOne(userId, id);

    if (dto.name) {
      const existing = await this.prisma.category.findUnique({
        where: {
          userId_name: {
            userId,
            name: dto.name,
          },
        },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Category with name "${dto.name}" already exists`,
        );
      }
    }

    const category = await this.prisma.category.update({
      where: { id },
      data: dto,
    });

    return this.toResponseDto(category);
  }

  async remove(userId: string, id: string): Promise<CategoryResponseDto> {
    await this.findOne(userId, id);

    const category = await this.prisma.category.delete({
      where: { id },
    });

    return this.toResponseDto(category);
  }
}
