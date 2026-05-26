import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './client'
import type { MediaResponse } from '@wikigdd/shared'

export function useGameMedia(gameId: string, pageId?: string) {
  return useQuery({
    queryKey: ['media', gameId, pageId],
    queryFn: () =>
      apiClient.get<{ media: MediaResponse[] }>(
        `/games/${gameId}/media${pageId ? `?pageId=${pageId}` : ''}`,
      ),
    enabled: Boolean(gameId),
  })
}

export function useUploadMedia(gameId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      file,
      pageId,
      kind,
    }: {
      file: File
      pageId?: string
      kind?: string
    }) => {
      const fd = new FormData()
      fd.append('file', file)
      if (pageId) fd.append('pageId', pageId)
      if (kind) fd.append('kind', kind)
      return apiClient.upload<{ media: MediaResponse }>(`/games/${gameId}/media`, fd)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['media', gameId] }),
  })
}

export function useDeleteMedia(gameId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.delete<void>(`/media/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['media', gameId] }),
  })
}
