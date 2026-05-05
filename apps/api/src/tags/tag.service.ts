import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';

@Injectable()
export class TagService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTagDto) {
    const normalizedName = dto.name.trim().toLowerCase();

    const existing = await this.prisma.tag.findUnique({
      where: { name: normalizedName },
    });

    if (existing) {
      throw new ConflictException(`Tag "${normalizedName}" already exists`);
    }

    return this.prisma.tag.create({
      data: { name: normalizedName },
    });
  }

  async findAll() {
    return this.prisma.tag.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with id "${id}" not found`);
    }

    return tag;
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.tag.delete({
      where: { id },
    });
  }
}
