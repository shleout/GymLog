import { Controller, Get } from '@nestjs/common'
import { Public } from '../auth/public.decorator.js'
import { PrismaService } from '../prisma/prisma.service.js'

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  /** For the host's health check; also pings the DB, so a lost connection shows up. */
  @Public()
  @Get()
  async check(): Promise<{ status: 'ok' }> {
    await this.prisma.$queryRaw`SELECT 1`
    return { status: 'ok' }
  }
}
