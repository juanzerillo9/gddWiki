import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './client'
import type { GameResponse, CreateGameBody, UpdateGameBody } from '@wikigdd/shared'

export function useGames() {
  return useQuery({
    queryKey: ['games'],
    queryFn: () => apiClient.get<{ games: GameResponse[] }>('/games'),
  })
}

export function useGame(slug: string) {
  return useQuery({
    queryKey: ['game', slug],
    queryFn: () => apiClient.get<{ game: GameResponse }>(`/games/${slug}`),
    enabled: Boolean(slug),
  })
}

export function useCreateGame() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateGameBody) =>
      apiClient.post<{ game: GameResponse }>('/games', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['games'] }),
  })
}

export function useUpdateGame() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGameBody }) =>
      apiClient.patch<{ game: GameResponse }>(`/games/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['games'] })
      qc.invalidateQueries({ queryKey: ['game'] })
    },
  })
}

export function useDeleteGame() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.delete<void>(`/games/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['games'] }),
  })
}
