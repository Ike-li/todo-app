import { Exclude, Type } from 'class-transformer';

export class CategoryResponseDto {
  id!: string;
  name!: string;
  color!: string | null;
  icon!: string | null;

  @Exclude()
  userId!: string;

  @Exclude()
  createdAt!: Date;
}

export class TagResponseDto {
  id!: string;
  name!: string;
}

export class TagsOnTodosResponseDto {
  @Type(() => TagResponseDto)
  tag!: TagResponseDto;

  @Exclude()
  todoId!: string;

  @Exclude()
  tagId!: string;
}

export class TodoResponseDto {
  id!: string;
  title!: string;
  description!: string | null;
  completed!: boolean;
  priority!: string;
  dueDate!: Date | null;
  position!: number;
  createdAt!: Date;
  updatedAt!: Date;

  @Type(() => CategoryResponseDto)
  category!: CategoryResponseDto | null;

  @Type(() => TagsOnTodosResponseDto)
  tags!: TagsOnTodosResponseDto[];

  parentId!: string | null;

  @Type(() => TodoResponseDto)
  subTasks?: TodoResponseDto[];

  @Exclude()
  userId!: string;

  @Exclude()
  categoryId!: string | null;
}
