import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../auth/public.decorator';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('System')
@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  // Direct SELECT 1 — Terminus' PrismaHealthIndicator is incompatible with
  // Prisma 7's driver-adapter client (pingCheck 503s while queries work).
  @Public()
  @Get()
  @ApiOperation({
    summary: '🌐 Health check',
    description:
      'Reports service and database status. Returns 200 when the API can reach the database, 503 otherwise. Useful for uptime monitors and the keep-warm cron.',
  })
  @ApiResponse({ status: 200, description: 'Service and database are healthy' })
  @ApiResponse({ status: 503, description: 'Database unreachable' })
  async check() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', database: 'up' };
    } catch {
      throw new ServiceUnavailableException({
        status: 'error',
        database: 'down',
      });
    }
  }
}
