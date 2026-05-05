import {
  IsString,
  IsOptional,
  IsHexColor,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateCategoryDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @IsHexColor()
  @IsOptional()
  color?: string | null;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  icon?: string | null;
}
