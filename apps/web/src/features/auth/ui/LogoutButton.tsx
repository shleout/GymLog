import { logout } from '@/entities/session'
import { ConfirmAction } from '@/shared/ui'

/** Local data stays on the device: until sync exists, the server has no copy of it. */
export const LogoutButton = () => (
  <ConfirmAction
    label="Выйти из аккаунта"
    question="Выйти из аккаунта? Данные останутся на этом устройстве."
    confirmLabel="Выйти"
    onConfirm={() => void logout()}
  />
)
