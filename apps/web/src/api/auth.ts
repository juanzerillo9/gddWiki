import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './client'
import type { UserResponse, LoginBody, RegisterBody } from '@wikigdd/shared'

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => apiClient.get<{ user: UserResponse }>('/auth/me'),
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
}

export function useLogin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: LoginBody) =>
      apiClient.post<{ user: UserResponse }>('/auth/login', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['currentUser'] }),
  })
}

export function useRegister() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: RegisterBody) =>
      apiClient.post<{ user: UserResponse }>('/auth/register', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['currentUser'] }),
  })
}

export function useLogout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => apiClient.post<{ ok: boolean }>('/auth/logout'),
    onSuccess: () => {
      qc.clear()
    },
  })
}
