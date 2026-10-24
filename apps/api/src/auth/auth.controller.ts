import { Body, Controller, Get, HttpCode, Post, Req, Res } from '@nestjs/common'
import { CredentialsSchema, type AuthResponse, type Credentials, type User } from '@gymlog/schemas'
import type { Request, Response } from 'express'
import { ZodValidationPipe } from '../common/zod-validation.pipe.js'
import { AuthService, type Session } from './auth.service.js'
import { CurrentUserId } from './current-user-id.decorator.js'
import { Public } from './public.decorator.js'
import { clearRefreshCookie, readRefreshCookie, setRefreshCookie } from './refresh-cookie.js'

const credentialsPipe = new ZodValidationPipe(CredentialsSchema)

/** Puts the refresh token into the cookie and returns the rest as the response body. */
const respond = (res: Response, session: Session): AuthResponse => {
  setRefreshCookie(res, session.refreshToken, session.refreshExpiresAt)
  return { accessToken: session.accessToken, user: session.user }
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('register')
  async register(
    @Body(credentialsPipe) body: Credentials,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    return respond(res, await this.auth.register(body))
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  async login(
    @Body(credentialsPipe) body: Credentials,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    return respond(res, await this.auth.login(body))
  }

  /** New access token by the refresh cookie; the client calls it on 401 and at startup. */
  @Public()
  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    try {
      return respond(res, await this.auth.refresh(readRefreshCookie(req)))
    } catch (error) {
      clearRefreshCookie(res)
      throw error
    }
  }

  /** Public: logging out must work with an expired access token too. */
  @Public()
  @Post('logout')
  @HttpCode(204)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    await this.auth.logout(readRefreshCookie(req))
    clearRefreshCookie(res)
  }

  @Get('me')
  me(@CurrentUserId() userId: string): Promise<User> {
    return this.auth.getUser(userId)
  }
}
