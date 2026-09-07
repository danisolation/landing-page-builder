import { IsString, IsOptional, IsBoolean, MaxLength, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePageDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  // SEO fields
  @ApiProperty({ required: false, maxLength: 255 })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  metaTitle?: string;

  @ApiProperty({ required: false, maxLength: 500 })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  metaDescription?: string;

  @ApiProperty({ required: false, maxLength: 2048 })
  @IsString()
  @IsOptional()
  @MaxLength(2048)
  ogImageUrl?: string;

  @ApiProperty({ required: false, maxLength: 500 })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  keywords?: string;

  @ApiProperty({ required: false, maxLength: 2048 })
  @IsString()
  @IsOptional()
  @MaxLength(2048)
  canonicalUrl?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  // Editor global styles (StylePanel) — persisted as-is, FE defines the shape
  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  globalStyle?: Record<string, unknown>;
}