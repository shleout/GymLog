import { useEffect, useMemo, useState } from 'react'
import { CredentialsSchema, login, register, type Credentials } from '@/entities/session'
import { ApiError } from '@/shared/api'
import { collectErrors, type FormErrors } from '@/shared/lib'
import { RegisterFormSchema } from './schemas'

export type AuthMode = 'login' | 'register'

/** The repeated password is kept across mode switches but used only for registration. */
type AuthDraft = Credentials & { passwordConfirm: string }

const parseDraft = (mode: AuthMode, draft: AuthDraft) =>
  mode === 'login' ? CredentialsSchema.safeParse(draft) : RegisterFormSchema.safeParse(draft)

/** After this long a pending request most likely waits for the sleeping API to boot. */
const SLOW_REQUEST_MS = 4000

const toFormError = (error: unknown): FormErrors => {
  if (!(error instanceof ApiError)) return { form: 'Что-то пошло не так, попробуйте ещё раз' }
  if (error.status === 409) return { email: error.message }
  if (error.status === 0) return { form: 'Нет соединения с сервером. Проверьте интернет' }
  return { form: error.message }
}

export const useAuthForm = (mode: AuthMode) => {
  const [draft, setDraft] = useState<AuthDraft>({ email: '', password: '', passwordConfirm: '' })
  const [submitted, setSubmitted] = useState(false)
  const [pending, setPending] = useState(false)
  const [slow, setSlow] = useState(false)
  const [serverErrors, setServerErrors] = useState<FormErrors>({})

  const validationErrors = useMemo<FormErrors>(() => {
    if (!submitted) return {}
    const result = parseDraft(mode, draft)
    return result.success ? {} : collectErrors(result.error)
  }, [mode, draft, submitted])

  useEffect(() => {
    if (!pending) return
    const timer = setTimeout(() => setSlow(true), SLOW_REQUEST_MS)
    return () => {
      clearTimeout(timer)
      setSlow(false)
    }
  }, [pending])

  const setField = (field: keyof AuthDraft, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }))
    setServerErrors({})
  }

  /** Success switches the session, and the router guard takes the user into the app. */
  const submit = async (): Promise<void> => {
    setSubmitted(true)
    const result = parseDraft(mode, draft)
    if (!result.success || pending) return
    // Only credentials go to the API: passwordConfirm is a client-side check.
    const credentials: Credentials = { email: result.data.email, password: result.data.password }
    setPending(true)
    setServerErrors({})
    try {
      await (mode === 'login' ? login(credentials) : register(credentials))
    } catch (error) {
      setServerErrors(toFormError(error))
      setPending(false)
    }
  }

  return {
    draft,
    errors: { ...validationErrors, ...serverErrors },
    pending,
    slow,
    setField,
    submit,
  }
}
