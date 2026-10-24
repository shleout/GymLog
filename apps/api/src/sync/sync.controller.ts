import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common'
import {
  SyncPullQuerySchema,
  SyncPushEnvelopeSchema,
  type SyncPullQuery,
  type SyncPullResponse,
  type SyncPushResponse,
} from '@gymlog/schemas'
import type { z } from 'zod'
import { CurrentUserId } from '../auth/current-user-id.decorator.js'
import { ZodValidationPipe } from '../common/zod-validation.pipe.js'
import { SyncService } from './sync.service.js'

@Controller('sync')
export class SyncController {
  constructor(private readonly sync: SyncService) {}

  /** Client's local changes (from its outbox). Records are validated one by one. */
  @Post('push')
  @HttpCode(200)
  push(
    @CurrentUserId() userId: string,
    @Body(new ZodValidationPipe(SyncPushEnvelopeSchema))
    body: z.output<typeof SyncPushEnvelopeSchema>,
  ): Promise<SyncPushResponse> {
    return this.sync.push(userId, body)
  }

  /** Changes after `cursor`, page by page: repeat while `hasMore`. */
  @Get('pull')
  pull(
    @CurrentUserId() userId: string,
    @Query(new ZodValidationPipe(SyncPullQuerySchema)) query: SyncPullQuery,
  ): Promise<SyncPullResponse> {
    return this.sync.pull(userId, query.cursor)
  }
}
