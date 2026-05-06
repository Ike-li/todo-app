import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { QueryTodoDto } from './dto/query-todo.dto';
import { ReorderTodosDto } from './dto/reorder-todo.dto';

interface RequestWithUser extends Request {
  user: { sub: string };
}

@ApiTags('todos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new todo' })
  @ApiResponse({ status: 201, description: 'Todo created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Req() req: RequestWithUser, @Body() dto: CreateTodoDto) {
    return this.todosService.create(req.user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all todos with pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of todos' })
  async findAll(@Req() req: RequestWithUser, @Query() query: QueryTodoDto) {
    return this.todosService.findAll(req.user.sub, query);
  }

  @Get(':id/subtasks')
  @ApiOperation({ summary: 'Get sub-tasks of a todo' })
  @ApiParam({ name: 'id', description: 'Todo UUID' })
  @ApiResponse({ status: 200, description: 'List of sub-tasks' })
  @ApiResponse({ status: 404, description: 'Todo not found' })
  async getSubTasks(
    @Req() req: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.todosService.getSubTasks(req.user.sub, id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single todo by ID' })
  @ApiParam({ name: 'id', description: 'Todo UUID' })
  @ApiResponse({ status: 200, description: 'Todo details' })
  @ApiResponse({ status: 404, description: 'Todo not found' })
  async findOne(
    @Req() req: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.todosService.findOne(req.user.sub, id);
  }

  @Patch('reorder')
  @ApiOperation({ summary: 'Reorder todos by updating positions' })
  @ApiResponse({ status: 200, description: 'Todos reordered successfully' })
  async reorder(@Req() req: RequestWithUser, @Body() dto: ReorderTodosDto) {
    return this.todosService.reorder(req.user.sub, dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a todo',
    description:
      'Pass null to clear optional fields (description, dueDate, categoryId, parentId). Pass tags: [] to remove all tags. Omit fields to leave them unchanged.',
  })
  @ApiParam({ name: 'id', description: 'Todo UUID' })
  @ApiResponse({ status: 200, description: 'Todo updated' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden (e.g., parentId references self)',
  })
  @ApiResponse({ status: 404, description: 'Todo not found' })
  async update(
    @Req() req: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTodoDto,
  ) {
    return this.todosService.update(req.user.sub, id, dto);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Toggle todo completed status' })
  @ApiParam({ name: 'id', description: 'Todo UUID' })
  @ApiResponse({ status: 200, description: 'Todo toggled' })
  @ApiResponse({ status: 404, description: 'Todo not found' })
  async toggle(
    @Req() req: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.todosService.toggle(req.user.sub, id);
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Delete a todo',
    description: 'Deleting a parent todo will cascade-delete all sub-tasks.',
  })
  @ApiParam({ name: 'id', description: 'Todo UUID' })
  @ApiResponse({ status: 200, description: 'Todo deleted' })
  @ApiResponse({ status: 404, description: 'Todo not found' })
  async remove(
    @Req() req: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.todosService.remove(req.user.sub, id);
    return { message: 'Todo deleted successfully' };
  }
}
