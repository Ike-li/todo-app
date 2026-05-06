import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsArray,
  IsUUID,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Priority } from './create-todo.dto';

export class UpdateTodoDto {
  @ApiPropertyOptional({ example: 'Buy groceries (updated)', maxLength: 255 })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    example: 'Updated description',
    maxLength: 5000,
    nullable: true,
  })
  @IsString()
  @MaxLength(5000)
  @IsOptional()
  description?: string | null;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  completed?: boolean;

  @ApiPropertyOptional({ enum: Priority, example: Priority.HIGH })
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @ApiPropertyOptional({
    example: '2026-06-01',
    description: 'Due date in YYYY-MM-DD or ISO 8601 format',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?$/, {
    message: 'dueDate must be a valid date string (YYYY-MM-DD or ISO 8601)',
  })
  dueDate?: string | null;

  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'Category UUID',
    nullable: true,
  })
  @IsUUID()
  @IsOptional()
  categoryId?: string | null;

  @ApiPropertyOptional({ example: ['shopping', 'urgent'], type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    description: 'Parent todo UUID',
    nullable: true,
  })
  @IsUUID()
  @IsOptional()
  parentId?: string | null;
}
