import { z } from 'zod'

export const PageTypeSchema = z.enum([
  'doc',
  'section',
  'character',
  'item',
  'enemy',
  'level',
  'mechanic',
])

export const CreatePageBodySchema = z.object({
  type: PageTypeSchema.default('doc'),
  title: z.string().min(1).max(200),
  parentId: z.string().nullable().optional(),
  icon: z.string().optional(),
  content: z.record(z.unknown()).optional(),
  attributes: z.record(z.string()).optional(),
})

export const UpdatePageBodySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  icon: z.string().nullable().optional(),
  content: z.record(z.unknown()).optional(),
  attributes: z.record(z.string()).optional(),
  parentId: z.string().nullable().optional(),
  orderIndex: z.number().int().optional(),
})

export const ReorderItemSchema = z.object({
  id: z.string(),
  parentId: z.string().nullable(),
  orderIndex: z.number().int(),
})

export const ReorderBodySchema = z.object({
  items: z.array(ReorderItemSchema).min(1),
})

export const PageResponseSchema = z.object({
  id: z.string(),
  gameId: z.string(),
  parentId: z.string().nullable(),
  type: PageTypeSchema,
  title: z.string(),
  slug: z.string(),
  icon: z.string().nullable(),
  content: z.record(z.unknown()),
  attributes: z.record(z.string()),
  orderIndex: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type PageType = z.infer<typeof PageTypeSchema>
export type CreatePageBody = z.infer<typeof CreatePageBodySchema>
export type UpdatePageBody = z.infer<typeof UpdatePageBodySchema>
export type ReorderItem = z.infer<typeof ReorderItemSchema>
export type ReorderBody = z.infer<typeof ReorderBodySchema>
export type PageResponse = z.infer<typeof PageResponseSchema>
