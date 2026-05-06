import {
  IsString,
  IsOptional,
  IsHexColor,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Personal', maxLength: 100 })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: '#e74c3c',
    description: 'Hex color code',
    nullable: true,
  })
  @IsHexColor()
  @IsOptional()
  color?: string | null;

  @ApiPropertyOptional({
    example: 'home',
    maxLength: 50,
    description: 'Icon identifier',
    nullable: true,
  })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  icon?: string | null;
}
