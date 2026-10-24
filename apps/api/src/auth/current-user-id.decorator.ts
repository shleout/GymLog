import { createParamDecorator, type ExecutionContext } from '@nestjs/common'
import type { Request } from 'express'

/** Request after AuthGuard has verified the access token. */
export type AuthenticatedRequest = Request & { userId: string }

/** Id of the user from the verified access token: `me(@CurrentUserId() userId: string)`. */
export const CurrentUserId = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string =>
    context.switchToHttp().getRequest<AuthenticatedRequest>().userId,
)
