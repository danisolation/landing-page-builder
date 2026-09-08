import { IsString, IsOptional, IsObject, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

const SECTION_TYPES = [
  'hero',
  'features',
  'cta',
  'stats',
  'testimonials',
  'pricing',
  'faq',
  'logoCloud',
] as const;

export class UpdateSectionDto {
  @ApiPropertyOptional({
    description: 'Section type — determines which frontend component renders this content',
    enum: SECTION_TYPES,
    example: 'hero',
  })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({
    description: 'Section content — free-form JSON whose shape depends on the section type',
    example: { heading: 'Updated heading', subheading: 'Updated subheading' },
  })
  @IsObject()
  @IsOptional()
  content?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Display order among the page sections (0-based)',
    example: 0,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;
}
