import {
  AdminUserDataSchema,
  AdminUsersResponseSchema,
  type AdminUserData,
  type AdminUserSummary,
} from '@gymlog/schemas'
import { apiRequest } from '@/shared/api'

export const fetchAdminUsers = (): Promise<AdminUserSummary[]> =>
  apiRequest('/admin/users', { schema: AdminUsersResponseSchema })

export const fetchAdminUserData = (userId: string): Promise<AdminUserData> =>
  apiRequest(`/admin/users/${encodeURIComponent(userId)}`, { schema: AdminUserDataSchema })
