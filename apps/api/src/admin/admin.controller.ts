import { Controller, Get, Param, UseGuards } from '@nestjs/common'
import { AdminUserIdSchema, type AdminUserData, type AdminUserSummary } from '@gymlog/schemas'
import { ZodValidationPipe } from '../common/zod-validation.pipe.js'
import { AdminGuard } from './admin.guard.js'
import { AdminService } from './admin.service.js'

/** Read-only: the admin panel never changes other users' data. */
@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('users')
  users(): Promise<AdminUserSummary[]> {
    return this.admin.listUsers()
  }

  @Get('users/:userId')
  user(@Param('userId', new ZodValidationPipe(AdminUserIdSchema)) userId: string): Promise<AdminUserData> {
    return this.admin.getUserData(userId)
  }
}
