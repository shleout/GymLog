import { createHash, randomBytes } from 'node:crypto'
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import type { AuthResponse, Credentials, User } from '@gymlog/schemas'
import { hash, verify } from 'argon2'
import { getEnv } from '../config/env.js'
import { Prisma } from '../generated/prisma/client.js'
import { PrismaService } from '../prisma/prisma.service.js'
import type { AccessTokenPayload } from './auth.guard.js'

/** Auth response plus the refresh token, which the controller puts into a cookie. */
export type Session = AuthResponse & { refreshToken: string; refreshExpiresAt: Date }

const DAY_MS = 24 * 60 * 60 * 1000

/** Refresh tokens are random, not JWTs: they're looked up in the DB anyway, so they can be revoked. */
const generateRefreshToken = (): string => randomBytes(32).toString('base64url')

/** A fast hash is enough here: the token has 256 bits of entropy, unlike a password. */
const hashRefreshToken = (token: string): string => createHash('sha256').update(token).digest('hex')

const toUser = (user: { id: string; email: string }): User => ({ id: user.id, email: user.email })

@Injectable()
export class AuthService {
  /**
   * Verified when the email is unknown, so "no such user" takes as long as "wrong password"
   * and response time doesn't reveal which emails are registered.
   */
  private dummyHash: Promise<string> | undefined

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register({ email, password }: Credentials): Promise<Session> {
    try {
      const user = await this.prisma.user.create({
        data: { email, passwordHash: await hash(password) },
      })
      return await this.createSession(user)
    } catch (error) {
      // Unique constraint on email — checked by the DB, so two parallel sign-ups can't both pass.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Этот email уже зарегистрирован')
      }
      throw error
    }
  }

  async login({ email, password }: Credentials): Promise<Session> {
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user) {
      this.dummyHash ??= hash('dummy-password-for-timing')
      await verify(await this.dummyHash, password)
      throw new UnauthorizedException('Неверный email или пароль')
    }
    if (!(await verify(user.passwordHash, password))) {
      throw new UnauthorizedException('Неверный email или пароль')
    }

    // Opportunistic cleanup, so abandoned sessions don't pile up.
    await this.prisma.refreshToken.deleteMany({
      where: { userId: user.id, expiresAt: { lt: new Date() } },
    })
    return this.createSession(user)
  }

  /**
   * Rotation: the used refresh token is deleted and a new one is issued. A stolen token
   * works at most until the owner's next refresh, after which it's dead.
   */
  async refresh(refreshToken: string | undefined): Promise<Session> {
    if (!refreshToken) throw new UnauthorizedException()

    const tokenHash = hashRefreshToken(refreshToken)
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    })
    if (!stored || stored.expiresAt <= new Date()) throw new UnauthorizedException()

    // deleteMany doesn't throw when the row is gone: if two requests race with the same token,
    // only the one that actually deleted it gets a new session.
    const { count } = await this.prisma.refreshToken.deleteMany({ where: { id: stored.id } })
    if (count === 0) throw new UnauthorizedException()

    return this.createSession(stored.user)
  }

  async logout(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) return
    await this.prisma.refreshToken.deleteMany({ where: { tokenHash: hashRefreshToken(refreshToken) } })
  }

  async getUser(userId: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    // The access token can outlive a deleted account.
    if (!user) throw new UnauthorizedException()
    return toUser(user)
  }

  private async createSession(user: { id: string; email: string }): Promise<Session> {
    const refreshToken = generateRefreshToken()
    const refreshExpiresAt = new Date(Date.now() + getEnv().REFRESH_TOKEN_TTL_DAYS * DAY_MS)

    await this.prisma.refreshToken.create({
      data: { userId: user.id, tokenHash: hashRefreshToken(refreshToken), expiresAt: refreshExpiresAt },
    })
    const payload: AccessTokenPayload = { sub: user.id }

    return {
      accessToken: await this.jwt.signAsync(payload),
      user: toUser(user),
      refreshToken,
      refreshExpiresAt,
    }
  }
}
