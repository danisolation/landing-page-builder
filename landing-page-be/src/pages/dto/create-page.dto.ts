import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePageDto {
  @IsString()      // Phải là string
  @IsNotEmpty()    // Không được rỗng
  title!: string;

  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsString()
  @IsOptional()    // Có thể bỏ qua (undefined)
  description?: string;
}