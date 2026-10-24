import { useMemo, useState } from 'react'
import { z } from 'zod'
import { ProfileSchema, useProfileStore } from '@/entities/profile'
import { collectErrors, parseDecimal, type FormErrors } from '@/shared/lib'

type ProfileDraft = {
  nickname: string
  height: string
}

const ProfileFormSchema = z.object({
  nickname: z.string().pipe(ProfileSchema.shape.nickname),
  height: z.string().trim().transform(parseDecimal).pipe(ProfileSchema.shape.height),
})

export const useProfileForm = () => {
  const updateProfile = useProfileStore((state) => state.updateProfile)
  const [draft, setDraft] = useState<ProfileDraft>(() => {
    const { profile } = useProfileStore.getState()
    return {
      nickname: profile.nickname,
      height: profile.height === undefined ? '' : String(profile.height),
    }
  })
  const [submitted, setSubmitted] = useState(false)

  const errors = useMemo<FormErrors>(() => {
    if (!submitted) return {}
    const result = ProfileFormSchema.safeParse(draft)
    return result.success ? {} : collectErrors(result.error)
  }, [draft, submitted])

  const setField = (field: keyof ProfileDraft, value: string) =>
    setDraft((prev) => ({ ...prev, [field]: value }))

  /** Returns `true` when the profile was saved. */
  const submit = (): boolean => {
    setSubmitted(true)
    const result = ProfileFormSchema.safeParse(draft)
    if (!result.success) return false
    updateProfile(result.data)
    return true
  }

  return { draft, errors, setField, submit }
}
