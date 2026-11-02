import { Module } from '@nestjs/common'
import { AdminModule } from './admin/admin.module.js'
import { AuthModule } from './auth/auth.module.js'
import { HealthController } from './health/health.controller.js'
import { PrismaModule } from './prisma/prisma.module.js'
import { SyncModule } from './sync/sync.module.js'

@Module({
  imports: [PrismaModule, AuthModule, SyncModule, AdminModule],
  controllers: [HealthController],
})
export class AppModule {}
