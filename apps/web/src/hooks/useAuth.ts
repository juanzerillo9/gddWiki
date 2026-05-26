import { useCurrentUser } from '../api/auth'
import type { UserResponse } from '@wikigdd/shared'

export type AuthState =
  | { status: 'loading' }
  | { status: 'authenticated'; user: UserResponse }
  | { status: 'unauthenticated' }

export function useAuth(): AuthState {
  const { data, isLoading } = useCurrentUser()

  if (isLoading) return { status: 'loading' }
  if (data?.user) return { status: 'authenticated', user: data.user }
  return { status: 'unauthenticated' }
}

export function useRequireAuth(): UserResponse | null {
  const auth = useAuth()
  if (auth.status === 'authenticated') return auth.user
  return null
}
