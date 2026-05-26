import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './client'
import type { PageResponse, CreatePageBody, UpdatePageBody, ReorderBody, PageDetailResponse } from '@wikigdd/shared'

type PageTreeResponse = {
  tree: import('@wikigdd/shared').PageTreeNode[]
}

export function usePageTree(gameId: string) {
  return useQuery({
    queryKey: ['pageTree', gameId],
    queryFn: () => apiClient.get<PageTreeResponse>(`/games/${gameId}/pages`),
    enabled: Boolean(gameId),
  })
}

export function usePageBySlug(gameSlug: string, pageSlug: string) {
  return useQuery({
    queryKey: ['page', gameSlug, pageSlug],
    queryFn: () =>
      apiClient.get<PageDetailResponse>(
        `/games/${gameSlug}/pages/by-slug/${pageSlug}`,
      ),
    enabled: Boolean(gameSlug) && Boolean(pageSlug),
  })
}

export function usePage(id: string) {
  return useQuery({
    queryKey: ['page', id],
    queryFn: () => apiClient.get<PageDetailResponse>(`/pages/${id}`),
    enabled: Boolean(id),
  })
}

export function useCreatePage(gameId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreatePageBody) =>
      apiClient.post<{ page: PageResponse }>(`/games/${gameId}/pages`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pageTree', gameId] }),
  })
}

export function useUpdatePage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePageBody }) =>
      apiClient.patch<{ page: PageResponse }>(`/pages/${id}`, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['page', vars.id] })
    },
  })
}

export function useDeletePage(gameId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.delete<void>(`/pages/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pageTree', gameId] }),
  })
}

export function useReorderPages(gameId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: ReorderBody) =>
      apiClient.post<{ ok: boolean }>(`/games/${gameId}/pages/reorder`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pageTree', gameId] }),
  })
}
