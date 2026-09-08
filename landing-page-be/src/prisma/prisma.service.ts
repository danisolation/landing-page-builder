import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    const connectionString = process.env.DATABASE_URL;
    // Small pool — the Neon pooled endpoint (PgBouncer) caps free-tier
    // connections; node-postgres' default max:10 per instance can exhaust it.
    const adapter = new PrismaPg({ connectionString, max: 5 });
    super({ adapter });
  }

  // No eager $connect() on boot — the first query connects lazily, so a DB
  // blip or slow wake (Neon scale-to-zero) can't fail startup.

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
