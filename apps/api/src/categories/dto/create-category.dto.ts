import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsHexColor,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Work', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ example: '#3498db', description: 'Hex color code' })
  @IsHexColor()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({
    example: 'briefcase',
    maxLength: 50,
    description: 'Icon identifier',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  icon?: string;
}
