import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './client'
import type { VersionListItem, VersionDetail, CreateVersionBody } from '@wikigdd/shared'

export function useVersions(gameId: string) {
  return useQuery({
    queryKey: ['versions', gameId],
    queryFn: () => apiClient.get<{ versions: VersionListItem[] }>(`/games/${gameId}/versions`),
    enabled: Boolean(gameId),
  })
}

export function useVersion(id: string) {
  return useQuery({
    queryKey: ['version', id],
    queryFn: () => apiClient.get<{ version: VersionDetail }>(`/versions/${id}`),
    enabled: Boolean(id),
  })
}

export function useCreateVersion(gameId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateVersionBody) =>
      apiClient.post<{ version: VersionListItem }>(`/games/${gameId}/versions`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['versions', gameId] }),
  })
}

export function useRestoreVersion(gameId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post<{ ok: boolean }>(`/versions/${id}/restore`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['versions', gameId] })
      qc.invalidateQueries({ queryKey: ['pageTree', gameId] })
    },
  })
}

export function useDeleteVersion(gameId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.delete<void>(`/versions/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['versions', gameId] }),
  })
}
