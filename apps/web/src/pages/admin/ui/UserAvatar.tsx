import { cn } from '@/shared/lib'

type UserAvatarProps = {
  name: string
  className?: string
}

/** Violet, unlike the green avatar of the user's own profile: this is someone else. */
export const UserAvatar = ({ name, className }: UserAvatarProps) => (
  <div
    aria-hidden="true"
    className={cn(
      'flex size-11 shrink-0 items-center justify-center rounded-full bg-accent/20 text-lg font-bold text-accent',
      className,
    )}
  >
    {name.trim().charAt(0).toUpperCase() || '?'}
  </div>
)
