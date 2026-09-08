import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Admin username',
    example: 'admin',
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({
    description: 'Admin password (plain text — hashed server-side)',
    example: '123456',
    minLength: 8,
    maxLength: 100,
    format: 'password',
  })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
