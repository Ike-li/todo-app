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
import { Priority } from './create-todo.dto';

export class UpdateTodoDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @IsOptional()
  title?: string;

  @IsString()
  @MaxLength(5000)
  @IsOptional()
  description?: string | null;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;

  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @IsString()
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?$/, {
    message: 'dueDate must be a valid date string (YYYY-MM-DD or ISO 8601)',
  })
  dueDate?: string | null;

  @IsUUID()
  @IsOptional()
  categoryId?: string | null;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsUUID()
  @IsOptional()
  parentId?: string | null;
}
