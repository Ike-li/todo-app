import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

interface RequestWithUser extends Request {
  user: { sub: string };
}

@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  async create(
    @Req() req: RequestWithUser,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.categoryService.create(req.user.sub, dto);
  }

  @Get()
  async findAll(@Req() req: RequestWithUser) {
    return this.categoryService.findAll(req.user.sub);
  }

  @Get(':id')
  async findOne(
    @Req() req: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.categoryService.findOne(req.user.sub, id);
  }

  @Patch(':id')
  async update(
    @Req() req: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(req.user.sub, id, dto);
  }

  @Delete(':id')
  @HttpCode(200)
  async remove(
    @Req() req: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.categoryService.remove(req.user.sub, id);
  }
}
