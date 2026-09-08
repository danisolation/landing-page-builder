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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateSectionDto } from '../../sections/dto/create-section.dto';

const RESERVED_SLUGS = ['login', 'dashboard', 'pages', 'api', 'admin', 'sitemap', 'robots'];

export class CreatePageDto {
  @ApiProperty({
    description: 'Page title — shown in the browser tab and listings',
    example: 'BuildFlow - Tạo Landing Page trong 5 Phút',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    description:
      'URL slug — lowercase letters, numbers, and hyphens only. Reserved values (login, dashboard, pages, api, admin, sitemap, robots) are rejected.',
    example: 'home',
    pattern: '^[a-z0-9-]+$',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug must contain only lowercase letters, numbers, and hyphens' })
  @Matches(new RegExp(`^(?!(${RESERVED_SLUGS.join('|')})$)`), {
    message: 'This slug is reserved',
  })
  slug!: string;

  @ApiPropertyOptional({
    description: 'Short description — used in listings and meta fallback',
    example: 'BuildFlow giúp bạn tạo landing page chuyên nghiệp từ các components có sẵn, không cần code.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  // SEO fields
  @ApiPropertyOptional({
    description: '<title> tag — defaults to page title if omitted',
    example: 'BuildFlow - Landing Page Builder | Tạo Website trong 5 Phút',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  metaTitle?: string;

  @ApiPropertyOptional({
    description: '<meta name="description"> — search-engine snippet',
    example: 'BuildFlow giúp bạn tạo landing page chuyên nghiệp với drag-drop components, templates đẹp, SEO ready. Không cần viết code!',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  metaDescription?: string;

  @ApiPropertyOptional({
    description: '<meta property="og:image"> — social share image (1200×630 recommended)',
    example: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop',
    maxLength: 2048,
  })
  @IsString()
  @IsOptional()
  @MaxLength(2048)
  ogImageUrl?: string;

  @ApiPropertyOptional({
    description: '<meta name="keywords"> — comma-separated',
    example: 'landing page builder, page builder, tạo website, drag drop builder, no-code',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  keywords?: string;

  @ApiPropertyOptional({
    description: '<link rel="canonical"> — preferred URL for SEO',
    example: 'https://buildflow.app',
    maxLength: 2048,
  })
  @IsString()
  @IsOptional()
  @MaxLength(2048)
  canonicalUrl?: string;

  @ApiPropertyOptional({
    description: 'Whether the page is publicly visible at /<slug>',
    example: true,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  // Editor global styles (StylePanel) — persisted as-is, FE defines the shape
  @ApiPropertyOptional({
    description: 'Global style overrides (colors, fonts, spacing) — shape defined by the frontend StylePanel',
    example: {
      primaryColor: '#2563eb',
      fontFamily: 'inter',
      sectionSpacing: 80,
      contentWidth: 1152,
    },
  })
  @IsObject()
  @IsOptional()
  globalStyle?: Record<string, unknown>;

  // Sections khởi tạo cùng page (dùng cho tạo page từ template) — tùy chọn
  @ApiPropertyOptional({
    description: 'Initial sections to create alongside the page (max 20). Used when creating a page from a template.',
    type: [CreateSectionDto],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => CreateSectionDto)
  sections?: CreateSectionDto[];
}
