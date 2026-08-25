import { IsString, IsNotEmpty, IsObject, IsInt, Min } from 'class-validator';

export class CreateSectionDto {
  @IsString()
  @IsNotEmpty()
  type!: string;

  @IsObject()
  @IsNotEmpty()
  content!: Record<string, any>;

  @IsInt()
  @Min(0)
  order!: number;
}