import { Exclude } from 'class-transformer';

export class CategoryResponseDto {
  id!: string;
  name!: string;
  color!: string | null;
  icon!: string | null;
  createdAt!: Date;

  @Exclude()
  userId!: string;
}
