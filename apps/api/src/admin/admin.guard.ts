import { ForbiddenException, Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common'
import type { AuthenticatedRequest } from '../auth/current-user-id.decorator.js'
import { PrismaService } from '../prisma/prisma.service.js'

/**
 * Runs after the global AuthGuard, so the user id is already verified. The role is read from
 * the DB on every request instead of being put into the access token: revoking it takes
 * effect at once, not when a 15-minute token expires.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { userId } = context.switchToHttp().getRequest<AuthenticatedRequest>()
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { role: true } })
    if (user?.role !== 'admin') throw new ForbiddenException('Нужны права администратора')
    return true
  }
}
