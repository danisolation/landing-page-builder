import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
  ArrayMaxSize,
  ValidateNested,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSectionDto } from '../../sections/dto/create-section.dto';

export class CreatePageDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsString()
  @IsOptional()
  description?: string;

  // SEO fields
  @IsString()
  @IsOptional()
  @MaxLength(255)
  metaTitle?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  metaDescription?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2048)
  ogImageUrl?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  keywords?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2048)
  canonicalUrl?: string;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  // Sections khởi tạo cùng page (dùng cho tạo page từ template) — tùy chọn
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => CreateSectionDto)
  sections?: CreateSectionDto[];
}
