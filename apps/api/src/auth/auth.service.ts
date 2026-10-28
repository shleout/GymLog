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
   * Rotation with deferred revocation. Using token T issues a new token N (`previousId` = T),
   * but T is deleted only when N is used for the first time — that's the proof the client
   * received N. If the response with N is lost (the PWA frozen in the background while a
   * sleeping server wakes up, a proxy timeout), the cookie still holds T, and T still works.
   *
   * Using N deletes T and N's siblings (other tokens issued for T, e.g. on such retries).
   * So a stolen token works at most until the owner's next refresh with the new token;
   * a branch an attacker got from T dies as soon as the owner uses N, and vice versa.
   */
  async refresh(refreshToken: string | undefined): Promise<Session> {
    if (!refreshToken) throw new UnauthorizedException()

    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: hashRefreshToken(refreshToken) },
      include: { user: true },
    })
    if (!stored || stored.expiresAt <= new Date()) throw new UnauthorizedException()

    if (stored.previousId) {
      const previousId = stored.previousId
      const [, { count }] = await this.prisma.$transaction([
        this.prisma.refreshToken.deleteMany({
          where: { OR: [{ id: previousId }, { previousId, id: { not: stored.id } }] },
        }),
        // updateMany doesn't throw when the row is gone: a sibling used at the same moment
        // has just revoked this token, so this request loses.
        this.prisma.refreshToken.updateMany({ where: { id: stored.id }, data: { previousId: null } }),
      ])
      if (count === 0) throw new UnauthorizedException()
    }

    return this.createSession(stored.user, stored.id)
  }

  /** Revokes the token and everything still valid around it: its predecessor, siblings and successors. */
  async logout(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) return
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: hashRefreshToken(refreshToken) },
    })
    if (!stored) return
    const related: Prisma.RefreshTokenWhereInput[] = [{ id: stored.id }, { previousId: stored.id }]
    if (stored.previousId) related.push({ id: stored.previousId }, { previousId: stored.previousId })
    await this.prisma.refreshToken.deleteMany({ where: { OR: related } })
  }

  async getUser(userId: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    // The access token can outlive a deleted account.
    if (!user) throw new UnauthorizedException()
    return toUser(user)
  }

  private async createSession(user: { id: string; email: string }, previousId?: string): Promise<Session> {
    const refreshToken = generateRefreshToken()
    const refreshExpiresAt = new Date(Date.now() + getEnv().REFRESH_TOKEN_TTL_DAYS * DAY_MS)

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashRefreshToken(refreshToken),
        expiresAt: refreshExpiresAt,
        previousId,
      },
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
