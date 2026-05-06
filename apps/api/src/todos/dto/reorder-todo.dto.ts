import { IsArray, ValidateNested, IsUUID, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class TodoPositionDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'Todo UUID',
  })
  @IsUUID()
  id!: string;

  @ApiProperty({ example: 0, description: 'New position index' })
  @IsInt()
  position!: number;
}

export class ReorderTodosDto {
  @ApiProperty({
    type: [TodoPositionDto],
    description: 'Array of todo positions',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TodoPositionDto)
  items!: TodoPositionDto[];
}
