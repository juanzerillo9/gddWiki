import { z } from 'zod'

export const CreateVersionBodySchema = z.object({
  versionLabel: z.string().min(1).max(100),
  notes: z.string().optional(),
})

export const VersionListItemSchema = z.object({
  id: z.string(),
  gameId: z.string(),
  versionLabel: z.string(),
  notes: z.string().nullable(),
  createdAt: z.string(),
})

export const VersionDetailSchema = VersionListItemSchema.extend({
  snapshot: z.record(z.unknown()),
})

export type CreateVersionBody = z.infer<typeof CreateVersionBodySchema>
export type VersionListItem = z.infer<typeof VersionListItemSchema>
export type VersionDetail = z.infer<typeof VersionDetailSchema>
