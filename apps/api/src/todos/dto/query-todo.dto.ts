import {
  IsOptional,
  IsInt,
  IsBoolean,
  IsString,
  IsIn,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryTodoDto {
  @ApiPropertyOptional({
    example: 1,
    default: 1,
    minimum: 1,
    description: 'Page number',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    example: 20,
    default: 20,
    minimum: 1,
    maximum: 100,
    description: 'Items per page',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @ApiPropertyOptional({
    example: false,
    description: 'Filter by completed status',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  completed?: boolean;

  @ApiPropertyOptional({
    example: 'groceries',
    description: 'Search term for title/description',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: ['createdAt', 'updatedAt', 'position'],
    default: 'createdAt',
    description: 'Sort field',
  })
  @IsOptional()
  @IsIn(['createdAt', 'updatedAt', 'position'])
  sort: 'createdAt' | 'updatedAt' | 'position' = 'createdAt';

  @ApiPropertyOptional({
    enum: ['asc', 'desc'],
    default: 'desc',
    description: 'Sort order',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order: 'asc' | 'desc' = 'desc';
}
