import type { Resource } from '@/entities/admin-user'
import { cn } from '@/shared/lib'
import { Button } from '@/shared/ui'

type LoadStatusProps = {
  resource: Resource<unknown>
  onRetry: () => void
  className?: string
}

/**
 * Loading and errors of admin data. Without data — a full placeholder; with cached data —
 * only a compact notice above it, so a failed refresh doesn't hide what's already loaded.
 */
export const LoadStatus = ({ resource, onRetry, className }: LoadStatusProps) => {
  if (resource.data === null) {
    if (resource.status === 'error') {
      return (
        <div className={cn('flex flex-col items-center gap-3 py-12 text-center', className)}>
          <p className="text-danger">{resource.error}</p>
          <Button variant="secondary" onClick={onRetry}>
            Повторить
          </Button>
        </div>
      )
    }
    return (
      <p role="status" className={cn('py-12 text-center text-text-muted', className)}>
        Загрузка…
      </p>
    )
  }

  if (resource.status === 'error') {
    return (
      <div
        className={cn(
          'flex items-center justify-between gap-3 rounded-2xl border border-border px-4 py-2 text-sm',
          className,
        )}
      >
        <span className="text-danger">Не удалось обновить: {resource.error}</span>
        <Button variant="ghost" className="shrink-0" onClick={onRetry}>
          Повторить
        </Button>
      </div>
    )
  }
  return null
}
