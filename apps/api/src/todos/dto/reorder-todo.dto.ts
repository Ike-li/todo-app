import { IsArray, ValidateNested, IsUUID, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class TodoPositionDto {
  @IsUUID()
  id!: string;

  @IsInt()
  position!: number;
}

export class ReorderTodosDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TodoPositionDto)
  items!: TodoPositionDto[];
}
