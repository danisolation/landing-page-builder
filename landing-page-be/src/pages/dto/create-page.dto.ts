import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
  IsObject,
  ArrayMaxSize,
  ValidateNested,
  MaxLength,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSectionDto } from '../../sections/dto/create-section.dto';

const RESERVED_SLUGS = ['login', 'dashboard', 'pages', 'api', 'admin', 'sitemap', 'robots'];

export class CreatePageDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug must contain only lowercase letters, numbers, and hyphens' })
  @Matches(new RegExp(`^(?!(${RESERVED_SLUGS.join('|')})$)`), {
    message: 'This slug is reserved',
  })
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

  // Editor global styles (StylePanel) — persisted as-is, FE defines the shape
  @IsObject()
  @IsOptional()
  globalStyle?: Record<string, unknown>;

  // Sections khởi tạo cùng page (dùng cho tạo page từ template) — tùy chọn
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => CreateSectionDto)
  sections?: CreateSectionDto[];
}
