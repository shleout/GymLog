import { BadRequestException, type PipeTransform } from '@nestjs/common'
import type { z } from 'zod'

/** Formats zod issues as `path: message` strings for API error responses. */
export const formatIssues = (error: z.ZodError): string[] =>
  error.issues.map((issue) =>
    issue.path.length > 0 ? `${issue.path.join('.')}: ${issue.message}` : issue.message,
  )

/**
 * Validates and transforms a request part with a zod schema from @gymlog/schemas,
 * so the API and the frontend apply the same rules:
 * `@Body(new ZodValidationPipe(CredentialsSchema)) body: Credentials`.
 */
export class ZodValidationPipe<T extends z.ZodType> implements PipeTransform<unknown, z.output<T>> {
  constructor(private readonly schema: T) {}

  transform(value: unknown): z.output<T> {
    const result = this.schema.safeParse(value)
    if (!result.success) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Validation failed',
        issues: formatIssues(result.error),
      })
    }
    return result.data
  }
}
