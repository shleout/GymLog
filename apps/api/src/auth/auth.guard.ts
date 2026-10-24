import {
  Injectable,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import type { Request } from 'express'
import type { AuthenticatedRequest } from './current-user-id.decorator.js'
import { IS_PUBLIC_KEY } from './public.decorator.js'

export type AccessTokenPayload = { sub: string }

const extractBearerToken = (request: Request): string | undefined => {
  const [scheme, token] = request.headers.authorization?.split(' ') ?? []
  return scheme === 'Bearer' && token ? token : undefined
}

/**
 * Global guard: every route requires `Authorization: Bearer <access token>` unless marked @Public().
 * Secure by default — a new endpoint can't be left open by forgetting a decorator.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean | undefined>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) return true

    const request = context.switchToHttp().getRequest<Request>()
    const token = extractBearerToken(request)
    if (!token) throw new UnauthorizedException()

    try {
      const payload = await this.jwt.verifyAsync<AccessTokenPayload>(token)
      ;(request as AuthenticatedRequest).userId = payload.sub
    } catch {
      throw new UnauthorizedException()
    }
    return true
  }
}
