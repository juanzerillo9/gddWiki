import { z } from 'zod'

const ProjectTypeSchema = z.enum(['videogame', 'tabletop', 'app', 'novel', 'worldbuilding'])

export const CreateGameBodySchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  projectType: ProjectTypeSchema.default('videogame'),
  applyTemplate: z.boolean().default(true),
})

export const UpdateGameBodySchema = z.object({
  title: z.string().min(1).max(120).optional(),
  description: z.string().max(500).nullable().optional(),
  isPublic: z.boolean().optional(),
  coverImage: z.string().nullable().optional(),
})

export const GameResponseSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  coverImage: z.string().nullable(),
  isPublic: z.boolean(),
  projectType: ProjectTypeSchema.default('videogame'),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type CreateGameBody = z.infer<typeof CreateGameBodySchema>
export type UpdateGameBody = z.infer<typeof UpdateGameBodySchema>
export type GameResponse = z.infer<typeof GameResponseSchema>
