import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';

@ApiTags('tags')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new tag',
    description:
      'Tags are global (shared across all users). Name is normalized to lowercase and trimmed.',
  })
  @ApiResponse({ status: 201, description: 'Tag created' })
  @ApiResponse({ status: 409, description: 'Tag already exists' })
  async create(@Body() dto: CreateTagDto) {
    return this.tagService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all tags' })
  @ApiResponse({ status: 200, description: 'List of tags' })
  async findAll() {
    return this.tagService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single tag' })
  @ApiParam({ name: 'id', description: 'Tag UUID' })
  @ApiResponse({ status: 200, description: 'Tag details' })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tagService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Delete a tag',
    description:
      'Fails with 409 if the tag is still attached to any todos. Remove the tag from all todos first.',
  })
  @ApiParam({ name: 'id', description: 'Tag UUID' })
  @ApiResponse({ status: 200, description: 'Tag deleted' })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  @ApiResponse({
    status: 409,
    description: 'Tag is still in use by one or more todos',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.tagService.remove(id);
    return { message: 'Tag deleted successfully' };
  }
}
