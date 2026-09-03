import { IsString, IsNotEmpty, IsObject, IsInt, Min, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const SECTION_TYPES = ['hero', 'features', 'cta', 'stats', 'testimonials'] as const;

export class CreateSectionDto {
  @ApiProperty({ enum: SECTION_TYPES, example: 'hero' })
  @IsString()
  @IsNotEmpty()
  @IsIn(SECTION_TYPES, { message: 'Type phải là một trong: hero, features, cta, stats, testimonials' })
  type!: string;

  @ApiProperty({ example: { heading: 'Hello', subheading: 'World' } })
  @IsObject()
  @IsNotEmpty()
  content!: Record<string, any>;

  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  order!: number;
}