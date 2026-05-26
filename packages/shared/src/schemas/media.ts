import { z } from 'zod'

export const MediaKindSchema = z.enum(['image', 'sprite', 'gif'])

export const MediaResponseSchema = z.object({
  id: z.string(),
  gameId: z.string(),
  pageId: z.string().nullable(),
  url: z.string(),
  fileName: z.string(),
  mimeType: z.string(),
  sizeBytes: z.number(),
  width: z.number().nullable(),
  height: z.number().nullable(),
  kind: MediaKindSchema,
  createdAt: z.string(),
})

export type MediaKind = z.infer<typeof MediaKindSchema>
export type MediaResponse = z.infer<typeof MediaResponseSchema>

export const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
] as const
