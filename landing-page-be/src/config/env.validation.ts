import { plainToInstance } from 'class-transformer';
import { IsString, IsEnum, IsOptional, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsOptional()
  @IsEnum(['development', 'production', 'test'])
  NODE_ENV?: string;

  @IsString()
  DATABASE_URL!: string;

  @IsString()
  JWT_SECRET!: string;
}

export function validate(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(
      `Environment validation failed:\n${errors.toString()}`,
    );
  }

  return validated;
}
